// Configuration
const AIRTABLE_BASE_ID = 'YOUR_AIRTABLE_BASE_ID';
const AIRTABLE_TABLE_ID = 'YOUR_AIRTABLE_TABLE_ID';
const N8N_WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL';
const N8N_API_KEY = 'YOUR_N8N_API_KEY';
const AUTO_REFRESH_INTERVAL = 5000; // 5 seconds

// State
let allRecords = [];
let currentToken = null;
let autoRefreshTimer = null;

// Chart Instances
let confidenceChart = null;
let escalationChart = null;
let topQuestionsChart = null;

// DOM Elements
const tokenInput = document.getElementById('airtableToken');
const loadDataBtn = document.getElementById('loadDataBtn');
const statusEl = document.getElementById('status');
const questionInput = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const responseMessage = document.getElementById('responseMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const inputSection = document.getElementById('inputSection');
const historySection = document.getElementById('historySection');
const historyContainer = document.getElementById('historyContainer');
const chartsSection = document.getElementById('chartsSection');

// Event Listeners
loadDataBtn.addEventListener('click', handleLoadData);
sendBtn.addEventListener('click', handleSendQuestion);
clearBtn.addEventListener('click', handleClearQuestion);
tokenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLoadData();
});

// Load Data Handler
async function handleLoadData() {
    currentToken = tokenInput.value.trim();
    
    if (!currentToken) {
        showStatus('Please enter your Airtable API token', 'error');
        return;
    }

    showStatus('Loading data...', 'loading');
    
    try {
        allRecords = await fetchAirtableRecords(currentToken);
        
        if (allRecords.length === 0) {
            showStatus('No data found. Try sending some questions first.', 'error');
            inputSection.style.display = 'none';
            historySection.style.display = 'none';
            chartsSection.style.display = 'none';
            return;
        }

        updateMetrics();
        renderHistory();
        
        // Show input, charts, and history sections
        inputSection.style.display = 'block';
        historySection.style.display = 'block';
        chartsSection.style.display = 'block';
        
        showStatus(`✓ Loaded ${allRecords.length} records`, 'success');

        // Start auto-refresh
        if (autoRefreshTimer) clearInterval(autoRefreshTimer);
        autoRefreshTimer = setInterval(() => {
            refreshData();
        }, AUTO_REFRESH_INTERVAL);

    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        inputSection.style.display = 'none';
        historySection.style.display = 'none';
        chartsSection.style.display = 'none';
    }
}

// Fetch Airtable Records
async function fetchAirtableRecords(token) {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid Airtable token');
            }
            throw new Error(`Airtable API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        return data.records.map(record => ({
            id: record.id,
            message: record.fields.message || '',
            answer: record.fields.answer || '',
            confidence: Number(record.fields.confidence) || 0,
            escalated: record.fields.escalated === true,
            timestamp: record.createdTime || new Date().toISOString()
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    } catch (error) {
        throw new Error(`Failed to fetch from Airtable: ${error.message}`);
    }
}

// Send Question Handler
async function handleSendQuestion() {
    const question = questionInput.value.trim();
    
    if (!question) {
        showStatus('Please enter a question', 'error');
        return;
    }

    if (!currentToken) {
        showStatus('Please load data first', 'error');
        return;
    }

    showLoading(true);
    responseMessage.style.display = 'none';
    
    try {
        // Send question to n8n
        await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': N8N_API_KEY
            },
            body: JSON.stringify({ message: question })
        });

        // Wait for n8n to log to Airtable (2-3 seconds)
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Fetch latest record from Airtable (the source of truth)
        const newRecords = await fetchAirtableRecords(currentToken);
        const latestRecord = newRecords[0]; // Most recent

        // Display the actual Airtable data
        const statusText = latestRecord.escalated ? 'Escalated to human' : 'Resolved';
        responseMessage.innerHTML = `
            <strong>Answer:</strong> ${latestRecord.answer}<br>
            <strong>Status:</strong> ${statusText}<br>
            <strong>Confidence:</strong> ${(latestRecord.confidence * 100).toFixed(0)}%
        `;
        responseMessage.style.display = 'block';
        
        // Clear input
        questionInput.value = '';
        
        // Update all data
        allRecords = newRecords;
        updateMetrics();
        renderHistory();

    } catch (error) {
        responseMessage.innerHTML = `<strong>Error:</strong> ${error.message}`;
        responseMessage.style.display = 'block';
    } finally {
        showLoading(false);
    }
}

// Clear Question Handler
function handleClearQuestion() {
    questionInput.value = '';
    responseMessage.style.display = 'none';
}

// Refresh Data from Airtable
async function refreshData() {
    if (!currentToken) return;
    
    try {
        const newRecords = await fetchAirtableRecords(currentToken);
        
        // Check if new records exist
        if (newRecords.length > allRecords.length) {
            allRecords = newRecords;
            updateMetrics();
            renderHistory();
        }
    } catch (error) {
        console.error('Auto-refresh failed:', error);
    }
}

// Update Metrics
function updateMetrics() {
    const totalRequests = allRecords.length;
    const escalatedCount = allRecords.filter(r => r.escalated).length;
    const escalationRate = totalRequests > 0 ? ((escalatedCount / totalRequests) * 100).toFixed(1) : 0;
    const avgConfidence = totalRequests > 0 ? (allRecords.reduce((sum, r) => sum + r.confidence, 0) / totalRequests).toFixed(2) : 0;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRequests = allRecords.filter(r => new Date(r.timestamp) >= todayStart).length;

    document.getElementById('totalRequests').textContent = totalRequests;
    document.getElementById('escalationRate').textContent = escalationRate + '%';
    document.getElementById('avgConfidence').textContent = (avgConfidence * 100).toFixed(0) + '%';
    document.getElementById('todayRequests').textContent = todayRequests;

    updateCharts();
}

// Update Charts
function updateCharts() {
    // Brutalist styling constants
    const COLOR_HIGH = '#A9F0D1';   // Mint green
    const COLOR_MEDIUM = '#FFF394'; // Pastel yellow
    const COLOR_LOW = '#FFC2E2';    // Pastel pink
    const COLOR_BORDER = '#000000';
    const BORDER_WIDTH = 3;

    // --- Confidence Distribution (Donut) ---
    let high = 0, medium = 0, low = 0;
    allRecords.forEach(r => {
        if (r.confidence >= 0.8) high++;
        else if (r.confidence >= 0.5) medium++;
        else low++;
    });

    if (confidenceChart) confidenceChart.destroy();
    confidenceChart = new Chart(document.getElementById('confidenceChart'), {
        type: 'doughnut',
        data: {
            labels: ['High (>80%)', 'Medium (50-80%)', 'Low (<50%)'],
            datasets: [{
                data: [high, medium, low],
                backgroundColor: [COLOR_HIGH, COLOR_MEDIUM, COLOR_LOW],
                borderColor: COLOR_BORDER,
                borderWidth: BORDER_WIDTH
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: COLOR_BORDER,
                        font: { weight: 'bold', family: 'inherit' }
                    }
                }
            },
            cutout: '50%'
        }
    });

    // --- Escalation vs Resolved (Bar grouped by day) ---
    const dateMap = {};
    const sortedRecords = [...allRecords].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    sortedRecords.forEach(r => {
        const dateStr = new Date(r.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });
        if (!dateMap[dateStr]) dateMap[dateStr] = { resolved: 0, escalated: 0 };
        if (r.escalated) {
            dateMap[dateStr].escalated++;
        } else {
            dateMap[dateStr].resolved++;
        }
    });
    
    // Take last 7 days
    const dates = Object.keys(dateMap).slice(-7);
    const resolvedData = dates.map(d => dateMap[d].resolved);
    const escalatedData = dates.map(d => dateMap[d].escalated);

    if (escalationChart) escalationChart.destroy();
    escalationChart = new Chart(document.getElementById('escalationChart'), {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Resolved',
                    data: resolvedData,
                    backgroundColor: COLOR_HIGH,
                    borderColor: COLOR_BORDER,
                    borderWidth: BORDER_WIDTH
                },
                {
                    label: 'Escalated',
                    data: escalatedData,
                    backgroundColor: COLOR_LOW,
                    borderColor: COLOR_BORDER,
                    borderWidth: BORDER_WIDTH
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: COLOR_BORDER, font: { weight: 'bold' } },
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    border: { color: COLOR_BORDER, width: BORDER_WIDTH }
                },
                x: {
                    ticks: { color: COLOR_BORDER, font: { weight: 'bold' } },
                    grid: { display: false },
                    border: { color: COLOR_BORDER, width: BORDER_WIDTH }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: COLOR_BORDER, font: { weight: 'bold' } }
                }
            }
        }
    });

    // --- Top Questions by Frequency (Horizontal Bar) ---
    const questionMap = {};
    allRecords.forEach(r => {
        const q = r.message.trim();
        if (q) {
            questionMap[q] = (questionMap[q] || 0) + 1;
        }
    });
    
    // Sort and get top 5
    const sortedQuestions = Object.keys(questionMap)
        .map(q => ({ question: q, count: questionMap[q] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    if (topQuestionsChart) topQuestionsChart.destroy();
    topQuestionsChart = new Chart(document.getElementById('topQuestionsChart'), {
        type: 'bar',
        data: {
            labels: sortedQuestions.map(item => item.question),
            datasets: [{
                label: 'Frequency',
                data: sortedQuestions.map(item => item.count),
                backgroundColor: COLOR_HIGH,
                borderColor: COLOR_BORDER,
                borderWidth: BORDER_WIDTH
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: COLOR_BORDER, font: { weight: 'bold' } },
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    border: { color: COLOR_BORDER, width: BORDER_WIDTH }
                },
                y: {
                    ticks: { color: COLOR_BORDER, font: { weight: 'bold' } },
                    grid: { display: false },
                    border: { color: COLOR_BORDER, width: BORDER_WIDTH }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Render History
function renderHistory() {
    historyContainer.innerHTML = '';

    allRecords.slice(0, 20).forEach(record => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const confidenceClass = 
            record.confidence >= 0.8 ? 'confidence-high' :
            record.confidence >= 0.5 ? 'confidence-medium' :
            'confidence-low';

        const statusClass = record.escalated ? 'status-escalated' : 'status-resolved';
        const statusText = record.escalated ? '⚠️ Escalated' : '✓ Resolved';

        const timestamp = new Date(record.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        item.innerHTML = `
            <div class="history-question">Q: ${record.message}</div>
            <div class="history-answer">A: ${record.answer}</div>
            <div class="history-meta">
                <span class="badge ${confidenceClass}">
                    Confidence: ${(record.confidence * 100).toFixed(0)}%
                </span>
                <span class="badge ${statusClass}">
                    ${statusText}
                </span>
                <span class="history-time">${timestamp}</span>
            </div>
        `;

        historyContainer.appendChild(item);
    });
}

// Show/Hide Loading Indicator
function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
}

// Show Status Message
function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status';
        }, 5000);
    }
}

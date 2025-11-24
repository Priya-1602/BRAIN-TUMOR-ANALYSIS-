// Global variable to store patients
let patients = [];

// Fetch patients from the backend
async function fetchPatients() {
  try {
    const response = await fetch('/api/patients');
    if (response.ok) {
      patients = await response.json();
      renderPatientsTable();
    } else {
      console.error('Failed to fetch patients');
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
  }
}

// Function to handle dashboard button click
function handleDashboardClick(e) {
  e.preventDefault();
  // Show loading state
  const buttons = document.querySelectorAll('a[href="/dashboard"]');
  buttons.forEach(btn => {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.style.pointerEvents = 'none';
    
    // Restore button after 2 seconds
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.pointerEvents = 'auto';
    }, 2000);
  });
  
  // Navigate to dashboard
  window.location.href = '/dashboard';
}

// Function to handle chat button click
function handleChatClick(e) {
  e.preventDefault();
  // Toggle chat widget if it exists
  const chatWidget = document.getElementById('chatbot-widget');
  if (chatWidget) {
    chatWidget.classList.toggle('active');
    // Focus on input when opening
    if (chatWidget.classList.contains('active')) {
      const chatInput = document.getElementById('chatbot-input');
      if (chatInput) chatInput.focus();
    }
  } else {
    // Fallback navigation if chat widget not found
    window.location.href = '/chat';
  }
}

// Initialize the dashboard when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  // DOM already loaded
  initDashboard();
}

// Additional fallback to ensure header navigation is set up
if (typeof setupHeaderNavigation === 'function') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('Fallback: Setting up header navigation...');
      setupHeaderNavigation();
    }, 300);
  });
}

function initDashboard() {
  // Initialize dashboard if on dashboard page
  if (window.location.pathname === '/dashboard' || window.location.pathname === '/') {
    // Small delay to ensure all elements are loaded
    setTimeout(() => {
      initializeDashboard();
    }, 200);
  }
  
  // Setup navigation buttons
  document.querySelectorAll('a[href="/dashboard"], .dashboard-btn').forEach(btn => {
    btn.addEventListener('click', handleDashboardClick);
  });
  
  document.querySelectorAll('a[href="/chat"], .chat-btn').forEach(btn => {
    btn.addEventListener('click', handleChatClick);
  });
  
  // Set active state for header navigation links
  const currentPath = window.location.pathname;
  const headerDashboardLink = document.getElementById('header-dashboard-link');
  const headerAnalysisLink = document.getElementById('header-analysis-link');
  
  if (headerDashboardLink && (currentPath === '/' || currentPath === '/dashboard')) {
    headerDashboardLink.classList.add('active');
  }
  if (headerAnalysisLink && currentPath === '/analysis') {
    headerAnalysisLink.classList.add('active');
  }
  
  // Setup header navigation links with direct event handlers
  setTimeout(() => {
    setupHeaderNavigation();
  }, 100);
  }

// Setup header navigation links
function setupHeaderNavigation() {
  console.log('Setting up header navigation...');
  const headerDashboardLink = document.getElementById('header-dashboard-link');
  const headerAnalysisLink = document.getElementById('header-analysis-link');
  const headerAIAssistantLink = document.getElementById('header-ai-assistant-link');
  
  console.log('Dashboard link found:', !!headerDashboardLink);
  console.log('Analysis link found:', !!headerAnalysisLink);
  console.log('AI Assistant link found:', !!headerAIAssistantLink);
  
  // Setup Dashboard link
  if (headerDashboardLink) {
    headerDashboardLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Dashboard link clicked');
      window.location.href = '/';
    };
    console.log('Dashboard link handler attached');
  } else {
    console.error('Dashboard link not found!');
  }
  
  // Setup Analysis link
  if (headerAnalysisLink) {
    headerAnalysisLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Analysis link clicked');
      window.location.href = '/analysis';
    };
    console.log('Analysis link handler attached');
  } else {
    console.error('Analysis link not found!');
  }
  
  // Setup AI Assistant link
  if (headerAIAssistantLink) {
    headerAIAssistantLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('AI Assistant link clicked');
      const chatWidget = document.getElementById('chatbot-widget');
      if (chatWidget) {
        chatWidget.classList.add('active');
        const chatInput = document.getElementById('chatbot-input');
        if (chatInput) chatInput.focus();
      } else {
        console.error('Chatbot widget not found!');
      }
    };
    console.log('AI Assistant link handler attached');
  } else {
    console.error('AI Assistant link not found!');
  }
  
  console.log('Header navigation setup complete');
}

function initializeDashboard() {
  console.log('Initializing dashboard...');
  fetchPatients();
  fetchReports();
  setupSidebarNavigation();
  setupSidebarButtons();
  setupQuickActions();
  setupPatientActions();
  setupSearch();
  updateDashboardStats();
  initializeAnalysisChart();
  
  // Setup header navigation again after everything loads
  setTimeout(() => {
    setupHeaderNavigation();
  }, 200);
  
  // Add patient table render after a delay to ensure data is loaded
  setTimeout(() => {
    renderPatientsTable();
  }, 500);
  
  // Setup add patient button
  const addPatientBtn = document.getElementById('add-patient-btn');
  if (addPatientBtn) {
    addPatientBtn.addEventListener('click', (e) => {
  e.preventDefault();
      showAddPatientModal();
    });
  }
  
  console.log('Dashboard initialized');
}

// Fetch reports from the backend
async function fetchReports() {
  try {
    const response = await fetch('/api/reports');
    if (response.ok) {
      const reports = await response.json();
      renderReports(reports);
      updateReportsStats(reports);
    } else {
      console.error('Failed to fetch reports');
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
  }
}

// Render reports list
function renderReports(reports) {
  const reportsList = document.getElementById('reports-list');
  if (!reportsList) return;
  
  if (reports.length === 0) {
    reportsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>No recent reports found</p>
      </div>
    `;
    return;
  }
  
  // Show first 5 recent reports
  const recentReports = reports.slice(0, 5);
  reportsList.innerHTML = recentReports.map(report => `
    <div class="report-item">
      <div class="report-icon">
        <i class="fas fa-file-pdf"></i>
      </div>
      <div class="report-info">
        <div class="report-name">${report.filename.replace('report_', '').replace('.pdf', '')}</div>
        <div class="report-date">${report.date}</div>
      </div>
      <div class="report-actions">
        <a href="${report.url}" target="_blank" class="view-report-btn" title="View Report">
          <i class="fas fa-eye"></i>
        </a>
        <a href="${report.url}" download class="download-report-btn" title="Download">
          <i class="fas fa-download"></i>
        </a>
      </div>
    </div>
  `).join('');
}

// Update reports statistics
function updateReportsStats(reports) {
  const reportsTodayEl = document.getElementById('reports-today');
  if (reportsTodayEl) {
    const today = new Date().toISOString().split('T')[0];
    const todayReports = reports.filter(r => r.date.startsWith(today));
    reportsTodayEl.textContent = todayReports.length;
  }
  
  const pendingReportsEl = document.getElementById('pending-reports');
  if (pendingReportsEl) {
    // For now, set pending to 0 or calculate based on your logic
    pendingReportsEl.textContent = '0';
  }
}

// Setup sidebar navigation
function setupSidebarNavigation() {
  const reportsLink = document.getElementById('reports-link');
  const patientsLink = document.getElementById('patients-link');
  const settingsLink = document.getElementById('settings-link');
  
  if (reportsLink) {
    reportsLink.addEventListener('click', (e) => {
  e.preventDefault();
      const reportsSection = document.querySelector('.recent-reports');
      if (reportsSection) {
        reportsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  if (patientsLink) {
    patientsLink.addEventListener('click', (e) => {
      e.preventDefault();
      const patientsSection = document.querySelector('.recent-patients');
      if (patientsSection) {
        patientsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  if (settingsLink) {
    settingsLink.addEventListener('click', (e) => {
  e.preventDefault();
      alert('Settings functionality will be implemented here.');
    });
  }
}

// Setup patient action buttons
function setupPatientActions() {
  // View patient details
  document.addEventListener('click', (e) => {
    if (e.target.closest('.view-btn')) {
      const btn = e.target.closest('.view-btn');
      const patientId = btn.getAttribute('data-id');
      if (patientId) {
        viewPatientDetails(patientId);
      }
    }
  });
}

// Update dashboard statistics
function updateDashboardStats() {
  const totalPatientsEl = document.getElementById('total-patients');
  if (totalPatientsEl) {
    totalPatientsEl.textContent = patients.length || 0;
  }
}

// Initialize analysis chart
function initializeAnalysisChart() {
  const chartCanvas = document.getElementById('analysisChart');
  if (!chartCanvas || !window.Chart) return;
  
  const ctx = chartCanvas.getContext('2d');
  
  // Sample monthly data - in a real app, this would come from the API
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Analyses Performed',
      data: [12, 19, 15, 25, 22, 30],
      backgroundColor: 'rgba(37, 99, 235, 0.2)',
      borderColor: 'rgba(37, 99, 235, 1)',
      borderWidth: 2,
      fill: true
    }]
  };
  
  if (window.analysisChartInstance) {
    window.analysisChartInstance.destroy();
  }
  
  window.analysisChartInstance = new Chart(ctx, {
    type: 'line',
    data: monthlyData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Setup quick action buttons (New Report, Import Scan, Export Data)
function setupQuickActions() {
  // New Report button
  const newReportBtn = document.getElementById('new-report');
  if (newReportBtn) {
    newReportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/analysis';
    });
  }
  
  // Import Scan button
  const importScanBtn = document.getElementById('import-scan');
  if (importScanBtn) {
    importScanBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/analysis';
    });
  }
  
  // Export Data button
  const exportDataBtn = document.getElementById('export-data');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const [patientsRes, reportsRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/reports')
        ]);
        
        const patients = patientsRes.ok ? await patientsRes.json() : [];
        const reports = reportsRes.ok ? await reportsRes.json() : [];
        
        const exportData = {
          patients: patients,
          reports: reports,
          exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `brain_tumor_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
      } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export data. Please try again.');
      }
    });
  }
}

// Setup sidebar button handlers
function setupSidebarButtons() {
  // Sidebar dashboard button
  const sidebarDashboardBtn = document.getElementById('sidebar-dashboard-btn');
  if (sidebarDashboardBtn) {
    sidebarDashboardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const dashboardSection = document.querySelector('.dashboard-section');
      if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  // Sidebar chat button
  const sidebarChatBtn = document.getElementById('sidebar-chat-btn');
  if (sidebarChatBtn) {
    sidebarChatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const chatbotWidget = document.getElementById('chatbot-widget');
      if (chatbotWidget) {
        chatbotWidget.classList.add('active');
        const chatInput = document.getElementById('chatbot-input');
        if (chatInput) chatInput.focus();
      }
    });
  }
  
  // Header navigation links are handled by setupHeaderNavigation() function
  // Top bar buttons (if they exist)
  const topDashboardBtn = document.getElementById('top-dashboard-btn');
  const topChatbotBtn = document.getElementById('top-chatbot-btn');
  
  if (topDashboardBtn) {
    topDashboardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const dashboardSection = document.querySelector('.dashboard-section');
      if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  if (topChatbotBtn) {
    topChatbotBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const chatbotWidget = document.getElementById('chatbot-widget');
      if (chatbotWidget) {
        chatbotWidget.classList.add('active');
        const chatInput = document.getElementById('chatbot-input');
        if (chatInput) chatInput.focus();
      }
    });
  }
}

// Render the patients table
function renderPatientsTable() {
  const tbody = document.getElementById('recent-patients-list');
  if (!tbody) return;
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  if (patients.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--muted);">
          <i class="fas fa-users" style="font-size: 48px; margin-bottom: 10px; display: block; opacity: 0.3;"></i>
          No patients found. Click "Add New Patient" to add one.
        </td>
      </tr>
    `;
    return;
  }
  
  // Add rows for each patient
  patients.forEach(patient => {
    const row = document.createElement('tr');
    
    // Format the status badge
    let statusBadge = '';
    if (patient.status === 'active') {
      statusBadge = '<span class="status-badge status-active">Active</span>';
    } else if (patient.status === 'pending') {
      statusBadge = '<span class="status-badge status-pending">Pending</span>';
    } else {
      statusBadge = '<span class="status-badge status-inactive">Inactive</span>';
    }
    
    // Format the action buttons
    const actions = `
      <div class="action-buttons">
        <button class="action-btn view-btn" data-id="${patient.id}" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
        <button class="action-btn edit-btn" data-id="${patient.id}" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" data-id="${patient.id}" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    // Set the row HTML
    row.innerHTML = `
      <td>${patient.id}</td>
      <td><strong>${patient.name}</strong></td>
      <td>${patient.age}</td>
      <td>${patient.condition}</td>
      <td>${formatDate(patient.lastVisit)}</td>
      <td>${statusBadge}</td>
      <td>${actions}</td>
    `;
    
    tbody.appendChild(row);
  });
  
  // Add event listeners to action buttons
  addActionButtonListeners();
}

// Format date to a more readable format
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Show the add patient modal
function showAddPatientModal() {
  // In a real app, this would show a modal form to add a new patient
  alert('Add new patient functionality will be implemented here.');
  // You can implement a modal using your preferred modal library
  // or create a custom modal with HTML/CSS
}

// Add event listeners to action buttons
function addActionButtonListeners() {
  // View buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const patientId = e.currentTarget.getAttribute('data-id');
      viewPatientDetails(patientId);
    });
  });
  
  // Edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const patientId = e.currentTarget.getAttribute('data-id');
      editPatient(patientId);
    });
  });
  
  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const patientId = e.currentTarget.getAttribute('data-id');
      if (confirm(`Are you sure you want to delete patient ${patientId}?`)) {
        deletePatient(patientId);
      }
    });
  });
}

// View patient details
async function viewPatientDetails(patientId) {
  try {
    const response = await fetch(`/api/patient/${patientId}`);
    if (response.ok) {
      const patient = await response.json();
      showPatientDetailsModal(patient);
    } else {
      // Fallback to local patient data
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        showPatientDetailsModal(patient);
      } else {
        alert('Patient not found');
      }
    }
  } catch (error) {
    console.error('Error fetching patient details:', error);
  const patient = patients.find(p => p.id === patientId);
  if (patient) {
      showPatientDetailsModal(patient);
    }
  }
}

// Show patient details modal
function showPatientDetailsModal(patient) {
  // Create modal HTML
  const modal = document.createElement('div');
  modal.className = 'patient-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.closest('.patient-modal').remove()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Patient Details</h2>
        <button class="modal-close" onclick="this.closest('.patient-modal').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="patient-detail-section">
          <h3><i class="fas fa-user"></i> Personal Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Patient ID:</label>
              <span>${patient.id || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <label>Name:</label>
              <span>${patient.name || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <label>Age:</label>
              <span>${patient.age || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <label>Last Visit:</label>
              <span>${patient.lastVisit || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div class="patient-detail-section">
          <h3><i class="fas fa-stethoscope"></i> Medical Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Condition:</label>
              <span class="condition-badge">${patient.condition || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span class="status-badge ${patient.status === 'active' ? 'status-active' : patient.status === 'pending' ? 'status-pending' : 'status-inactive'}">${patient.status || 'active'}</span>
            </div>
          </div>
        </div>
        ${patient.report ? `
        <div class="patient-detail-section">
          <h3><i class="fas fa-file-medical"></i> Reports</h3>
          <div class="report-link">
            <a href="${patient.report}" target="_blank">
              <i class="fas fa-file-pdf"></i> View Report
            </a>
          </div>
        </div>
        ` : ''}
        ${patient.imagePath ? `
        <div class="patient-detail-section">
          <h3><i class="fas fa-image"></i> Images</h3>
          <div class="image-preview">
            <img src="${patient.imagePath}" alt="Patient Scan" />
          </div>
        </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.patient-modal').remove()">Close</button>
        <button class="btn btn-primary" onclick="editPatient('${patient.id}'); this.closest('.patient-modal').remove();">
          <i class="fas fa-edit"></i> Edit Patient
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add modal styles if not already present
  if (!document.getElementById('patient-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'patient-modal-styles';
    style.textContent = `
      .patient-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
      }
      .modal-content {
        position: relative;
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--border, #e5e7eb);
      }
      .modal-header h2 {
        margin: 0;
        font-size: 24px;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--muted, #6b7280);
      }
      .modal-body {
        padding: 20px;
      }
      .patient-detail-section {
        margin-bottom: 25px;
      }
      .patient-detail-section h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        color: var(--accent, #2563eb);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
      .detail-item {
        display: flex;
        flex-direction: column;
      }
      .detail-item label {
        font-weight: 600;
        color: var(--muted, #6b7280);
        font-size: 14px;
        margin-bottom: 5px;
      }
      .detail-item span {
        font-size: 16px;
        color: var(--text, #0b1020);
      }
      .condition-badge {
        display: inline-block;
        padding: 4px 12px;
        background: var(--accent-100, #dbeafe);
        color: var(--accent, #2563eb);
        border-radius: 6px;
        font-weight: 500;
      }
      .report-link a, .image-preview img {
        display: block;
        margin-top: 10px;
      }
      .image-preview img {
        max-width: 100%;
        border-radius: 8px;
        border: 1px solid var(--border, #e5e7eb);
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 20px;
        border-top: 1px solid var(--border, #e5e7eb);
      }
      .btn {
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .btn-primary {
        background: var(--accent, #2563eb);
        color: white;
      }
      .btn-secondary {
        background: var(--surface, #f9fafb);
        color: var(--text, #0b1020);
        border: 1px solid var(--border, #e5e7eb);
      }
    `;
    document.head.appendChild(style);
  }
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.querySelector('.search-bar input');
  if (!searchInput) return;
  
  let searchTimeout;
  const searchResultsContainer = document.createElement('div');
  searchResultsContainer.id = 'search-results';
  searchResultsContainer.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    margin-top: 8px;
    display: none;
  `;
  
  const searchBar = searchInput.closest('.search-bar');
  if (searchBar) {
    searchBar.style.position = 'relative';
    searchBar.appendChild(searchResultsContainer);
  }
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      searchResultsContainer.style.display = 'none';
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          displaySearchResults(data, searchResultsContainer);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300);
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchBar?.contains(e.target)) {
      searchResultsContainer.style.display = 'none';
    }
  });
}

function displaySearchResults(data, container) {
  const { patients: matchingPatients, reports: matchingReports } = data;
  
  if (matchingPatients.length === 0 && matchingReports.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">No results found</div>';
    container.style.display = 'block';
    return;
  }
  
  let html = '<div style="padding: 12px;">';
  
  // Display matching patients
  if (matchingPatients.length > 0) {
    html += '<div style="margin-bottom: 16px;"><strong style="color: #374151; font-size: 14px;">Patients:</strong></div>';
    matchingPatients.forEach(patient => {
      html += `
        <div style="padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; border-radius: 6px; margin-bottom: 4px; transition: background 0.2s;" 
             onmouseover="this.style.background='#f3f4f6'" 
             onmouseout="this.style.background='white'"
             onclick="viewPatientFromSearch('${patient.id}')">
          <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${patient.name || 'Unnamed Patient'}</div>
          <div style="font-size: 12px; color: #6b7280;">
            ID: ${patient.id} | Condition: ${patient.condition || 'N/A'} | Age: ${patient.age || 'N/A'}
          </div>
        </div>
      `;
    });
  }
  
  // Display matching reports
  if (matchingReports.length > 0) {
    html += '<div style="margin-top: 16px; margin-bottom: 16px;"><strong style="color: #374151; font-size: 14px;">PDF Reports:</strong></div>';
    matchingReports.forEach(report => {
      html += `
        <div style="padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; border-radius: 6px; margin-bottom: 4px; transition: background 0.2s;" 
             onmouseover="this.style.background='#f3f4f6'" 
             onmouseout="this.style.background='white'"
             onclick="window.open('${report.url}', '_blank')">
          <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
            <i class="fas fa-file-pdf" style="color: #dc2626; margin-right: 8px;"></i>${report.filename}
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            ${report.patient_name ? `Patient: ${report.patient_name} | ` : ''}Date: ${report.date}
          </div>
        </div>
      `;
    });
  }
  
  html += '</div>';
  container.innerHTML = html;
  container.style.display = 'block';
}

// View patient from search results
function viewPatientFromSearch(patientId) {
  viewPatientDetails(patientId);
  document.getElementById('search-results').style.display = 'none';
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) searchInput.value = '';
}

// Make function globally available
window.viewPatientFromSearch = viewPatientFromSearch;

// Edit patient
function editPatient(patientId) {
  // In a real app, this would show an edit form for the patient
  const patient = patients.find(p => p.id === patientId);
  if (patient) {
    alert(`Editing patient: ${patient.name} (${patient.id})`);
  }
}

// Delete patient
function deletePatient(patientId) {
  // In a real app, this would make an API call to delete the patient
  const index = patients.findIndex(p => p.id === patientId);
  if (index !== -1) {
    patients.splice(index, 1);
    renderPatientsTable(); // Refresh the table
    showNotification(`Patient ${patientId} has been deleted.`, 'success');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // In a real app, this would show a toast notification
  console.log(`${type.toUpperCase()}: ${message}`);
  // You can implement a toast notification system here
}

// Initialize tooltips
function initializeTooltips() {
  // This would initialize a tooltip library if you're using one
  // For example, with Bootstrap: $('[data-toggle="tooltip"]').tooltip();
  
  // Simple custom tooltip implementation
  const tooltipElements = document.querySelectorAll('[title]');
  tooltipElements.forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

// Show tooltip
function showTooltip(e) {
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.textContent = this.getAttribute('title');
  document.body.appendChild(tooltip);
  
  const rect = this.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  
  this._tooltip = tooltip;
}

// Hide tooltip
function hideTooltip() {
  if (this._tooltip) {
    this._tooltip.remove();
    this._tooltip = null;
  }
}

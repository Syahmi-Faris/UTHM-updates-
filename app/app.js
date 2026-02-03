// ===== Configuration =====
const API_BASE = '/api/admin';

// ===== Session Management =====
function setSession(adminName) {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('adminName', adminName);
}

function getSession() {
    return {
        isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
        adminName: sessionStorage.getItem('adminName')
    };
}

function clearSession() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('adminName');
}

// ===== Authentication Check =====
function checkAuth() {
    const session = getSession();
    const currentPage = window.location.pathname;

    if (currentPage.includes('dashboard.html') && !session.isLoggedIn) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }

    // Update admin name display
    if (session.isLoggedIn && document.getElementById('adminName')) {
        document.getElementById('adminName').textContent = `Welcome, ${session.adminName}`;
    }
}

// ===== Login Form Handler =====
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            // Disable button during request
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Signing in...</span>';

            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (result.success) {
                    setSession(result.adminName);
                    window.location.href = 'dashboard.html';
                } else {
                    errorMessage.textContent = result.message || 'Invalid credentials';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'Connection error. Please try again.';
                errorMessage.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Sign In</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>';
            }
        });
    }

    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            clearSession();
            window.location.href = 'login.html';
        });
    }
});

// ===== Load Dashboard Statistics =====
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/getDashboardStats()`);
        const data = await response.json();

        // Update the statistics cards with animation
        animateNumber('totalStudents', data.totalStudents);
        animateNumber('totalCourses', data.totalCourses);
        animateNumber('totalRegistrations', data.totalRegistrations);
        animateNumber('pendingRegistrations', data.pendingRegistrations);

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Show fallback values
        document.getElementById('totalStudents').textContent = '-';
        document.getElementById('totalCourses').textContent = '-';
        document.getElementById('totalRegistrations').textContent = '-';
        document.getElementById('pendingRegistrations').textContent = '-';
    }
}

// ===== Animate Number Counter =====
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1000; // 1 second
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);

        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ===== Load Chart Data =====
async function loadChartData() {
    try {
        // Load students per course data
        const courseResponse = await fetch(`${API_BASE}/getStudentsPerCourse()`);
        const courseData = await courseResponse.json();
        renderStudentsPerCourseChart(courseData.value || courseData);

        // Load enrollment trend data (default: 5 years)
        await loadEnrollmentTrend(5);

        // Load registration status data
        const regResponse = await fetch(`${API_BASE}/getRegistrationStatus()`);
        const regData = await regResponse.json();
        renderRegistrationStatusChart(regData.value || regData);

    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

// ===== Load Enrollment Trend Data =====
let enrollmentChart = null;

async function loadEnrollmentTrend(yearsBack) {
    try {
        const response = await fetch(`${API_BASE}/getEnrollmentTrend(yearsBack=${yearsBack})`);
        const data = await response.json();
        renderEnrollmentTrendChart(data.value || data);
    } catch (error) {
        console.error('Error loading enrollment trend:', error);
    }
}

// ===== Toggle Enrollment Chart (5yr / 10yr) =====
function toggleEnrollmentChart(years) {
    // Update active button
    document.querySelectorAll('.chart-toggle .toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.years) === years) {
            btn.classList.add('active');
        }
    });

    // Reload chart with new data
    loadEnrollmentTrend(years);
}

// ===== Render Students per Course Chart (Bar Chart) =====
function renderStudentsPerCourseChart(data) {
    const ctx = document.getElementById('studentsPerCourseChart');
    if (!ctx) return;

    const labels = data.map(item => item.courseCode);
    const values = data.map(item => item.studentCount);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Students',
                data: values,
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(79, 70, 229, 1)',
                    'rgba(14, 165, 233, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#64748b'
                    },
                    grid: {
                        color: 'rgba(203, 213, 225, 0.3)'
                    }
                },
                x: {
                    ticks: {
                        color: '#64748b'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ===== Render Enrollment Trend Chart (Faculty of Computing) =====
function renderEnrollmentTrendChart(data) {
    const ctx = document.getElementById('enrollmentTrendChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (enrollmentChart) {
        enrollmentChart.destroy();
    }

    const labels = data.map(item => item.year.toString());
    const values = data.map(item => item.studentCount);

    enrollmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Students',
                    data: values,
                    borderColor: 'rgba(79, 70, 229, 1)',
                    backgroundColor: 'rgba(79, 70, 229, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `Students: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#64748b',
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(203, 213, 225, 0.3)'
                    }
                },
                x: {
                    ticks: {
                        color: '#64748b'
                    },
                    grid: {
                        color: 'rgba(203, 213, 225, 0.3)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// ===== Render Registration Status Chart (Stacked Bar Chart) =====
function renderRegistrationStatusChart(data) {
    const ctx = document.getElementById('registrationStatusChart');
    if (!ctx) return;

    const labels = data.map(item => item.courseCode);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Registered',
                    data: data.map(item => item.registered),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 4
                },
                {
                    label: 'Not Registered',
                    data: data.map(item => item.notRegistered),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        color: '#475569'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false,
                    ticks: {
                        color: '#64748b'
                    },
                    grid: {
                        color: 'rgba(203, 213, 225, 0.3)'
                    }
                },
                x: {
                    stacked: false,
                    ticks: {
                        color: '#64748b'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

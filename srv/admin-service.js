const cds = require('@sap/cds');

// Global activity log storage (persists during app session)
let activityLog = [];

// Global settings storage (persists during app session)
let systemSettings = {
    semester: 'Semester 2 2025/2026',
    startDate: '2026-01-06',
    endDate: '2026-01-20',
    registrationOpen: true,
    maxCreditHours: 21,
    minCreditHours: 12,
    requireAaApproval: true,
    emailNewRegistrations: true,
    emailApprovals: true,
    dailySummary: false
};

module.exports = class AdminService extends cds.ApplicationService {

    async init() {

        // Handle login action
        this.on('login', async (req) => {
            const { username, password } = req.data;

            const { Admins } = this.entities;

            // Find admin with matching credentials
            const admin = await SELECT.one.from(Admins)
                .where({ username: username, password: password });

            if (admin) {
                // Record login activity
                activityLog.unshift({
                    type: 'login',
                    user: admin.name,
                    action: 'Logged into the system',
                    time: new Date().toISOString(),
                    icon: 'login'
                });

                return {
                    success: true,
                    message: 'Login successful',
                    adminName: admin.name
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid username or password',
                    adminName: null
                };
            }
        });

        // Handle dashboard statistics
        this.on('getDashboardStats', async (req) => {
            const { Courses } = this.entities;

            const courses = await SELECT.from(Courses);

            // Fixed statistics as per requirements
            return {
                totalStudents: 2639,
                totalCourses: courses.length,
                totalRegistrations: 1567,
                pendingRegistrations: 156
            };
        });

        // Get students per course (fixed data: Bioinfo least, Data Eng second least)
        this.on('getStudentsPerCourse', async (req) => {
            // Distribution: Total 2,639
            // SECJH (Software Engineering) - highest: 749
            // SECVH (Graphic & Multimedia): 600
            // SECRH (Network & Cybersecurity): 550
            // SECPH (Data Engineering) - second least: 420
            // SECBH (Bioinformatics) - least: 320

            return [
                { courseName: 'Software Engineering', courseCode: 'SECJH', studentCount: 749 },
                { courseName: 'Network and Cybersecurity', courseCode: 'SECRH', studentCount: 550 },
                { courseName: 'Graphic and Computer Multimedia', courseCode: 'SECVH', studentCount: 600 },
                { courseName: 'Bioinformatics', courseCode: 'SECBH', studentCount: 320 },
                { courseName: 'Data Engineering', courseCode: 'SECPH', studentCount: 420 }
            ];
        });

        // Get Faculty of Computing enrollment trends
        // Shows realistic growth pattern - 2026 ends at 2639 (total students)
        this.on('getEnrollmentTrend', async (req) => {
            const yearsBack = req.data.yearsBack || 5;

            // Full 10-year data (2017-2026) with realistic fluctuations
            const fullData = [
                { year: 2017, studentCount: 2456 },
                { year: 2018, studentCount: 2312 },
                { year: 2019, studentCount: 2589 },
                { year: 2020, studentCount: 2234 },
                { year: 2021, studentCount: 2478 },
                { year: 2022, studentCount: 2356 },
                { year: 2023, studentCount: 2687 },
                { year: 2024, studentCount: 2512 },
                { year: 2025, studentCount: 2745 },
                { year: 2026, studentCount: 2639 }
            ];

            // Return based on yearsBack parameter
            if (yearsBack === 10) {
                return fullData;
            } else {
                // Default: last 5 years (2022-2026)
                return fullData.slice(-5);
            }
        });

        // Get registration status per course (registered vs not registered)
        // Total students: 2639, Registered: 1567, Not Registered: 1072
        this.on('getRegistrationStatus', async (req) => {
            return [
                { courseCode: 'SECJH', courseName: 'Software Engineering', registered: 445, notRegistered: 304 },
                { courseCode: 'SECRH', courseName: 'Network and Cybersecurity', registered: 328, notRegistered: 222 },
                { courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', registered: 356, notRegistered: 244 },
                { courseCode: 'SECBH', courseName: 'Bioinformatics', registered: 185, notRegistered: 135 },
                { courseCode: 'SECPH', courseName: 'Data Engineering', registered: 253, notRegistered: 167 }
            ];
        });

        // Get pending registrations (summary by course + detailed list)
        this.on('getPendingRegistrations', async (req) => {
            // Summary: 156 total pending registrations by course
            const summary = [
                { courseCode: 'SECJH', courseName: 'Software Engineering', pendingCount: 45 },
                { courseCode: 'SECRH', courseName: 'Network and Cybersecurity', pendingCount: 32 },
                { courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', pendingCount: 38 },
                { courseCode: 'SECBH', courseName: 'Bioinformatics', pendingCount: 18 },
                { courseCode: 'SECPH', courseName: 'Data Engineering', pendingCount: 23 }
            ];

            // 10 students per course (showing 10 each)
            const registrations = {
                'SECJH': [
                    { studentId: 'A23CS0156', studentName: 'Muhammad Syahmi Faris bin Rusli', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0445', studentName: 'Muhammad Adam bin Razali', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0523', studentName: 'Danish Hakim bin Aziz', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS0601', studentName: 'Ahmad Farhan bin Yusof', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS0612', studentName: 'Nurul Aina binti Kamal', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS0623', studentName: 'Mohd Haziq bin Ismail', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS0634', studentName: 'Siti Aminah binti Rahman', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS0645', studentName: 'Khairul Anwar bin Samad', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS0656', studentName: 'Nur Atiqah binti Hassan', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-11' },
                    { studentId: 'A23CS0667', studentName: 'Muhammad Irfan bin Azman', courseCode: 'SECJH', courseName: 'Software Engineering', submittedDate: '2026-01-11' }
                ],
                'SECRH': [
                    { studentId: 'A23CS0234', studentName: 'Muhammad Naim bin Abdullah', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0267', studentName: 'Nuraisyah binti Zikre', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0701', studentName: 'Amir Hamzah bin Kamal', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS0712', studentName: 'Sarina binti Hashim', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS0723', studentName: 'Mohd Faiz bin Osman', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS0734', studentName: 'Nur Hidayah binti Razak', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS0745', studentName: 'Ahmad Danial bin Zainal', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS0756', studentName: 'Fatimah binti Abdullah', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS0767', studentName: 'Haziq bin Jaafar', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-11' },
                    { studentId: 'A23CS0778', studentName: 'Aina Sofea binti Noor', courseCode: 'SECRH', courseName: 'Network and Cybersecurity', submittedDate: '2026-01-11' }
                ],
                'SECVH': [
                    { studentId: 'A23CS0189', studentName: 'Muhammad Afiq Danish bin Mohd Hazni', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0178', studentName: 'Hoe Zhi Wan', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0801', studentName: 'Tan Wei Ming', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS0812', studentName: 'Lim Siew Ling', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS0823', studentName: 'Wong Kai Xin', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS0834', studentName: 'Nurul Syafiqah binti Ali', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS0845', studentName: 'Lee Jun Wei', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS0856', studentName: 'Ong Mei Ying', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS0867', studentName: 'Ahmad Zulkifli bin Hassan', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-11' },
                    { studentId: 'A23CS0878', studentName: 'Ng Wei Lin', courseCode: 'SECVH', courseName: 'Graphic and Computer Multimedia', submittedDate: '2026-01-11' }
                ],
                'SECBH': [
                    { studentId: 'A23CS0312', studentName: 'Welson Woong Lu Bin', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0901', studentName: 'Nurul Aisyah binti Razak', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0912', studentName: 'Irfan bin Mohd Noor', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS0923', studentName: 'Chan Siew Mei', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS0934', studentName: 'Mohd Hafiz bin Yusof', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS0945', studentName: 'Nur Amira binti Kamal', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS0956', studentName: 'Tan Jia Wei', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS0967', studentName: 'Siti Nur Ain binti Samad', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS0978', studentName: 'Lim Chun Kiat', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-11' },
                    { studentId: 'A23CS0989', studentName: 'Ahmad Firdaus bin Rahman', courseCode: 'SECBH', courseName: 'Bioinformatics', submittedDate: '2026-01-11' }
                ],
                'SECPH': [
                    { studentId: 'A23CS0098', studentName: 'Ang Chun Wei', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS0334', studentName: 'Muhammad Amirun Irfan bin Samsul Shah', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-15' },
                    { studentId: 'A23CS1001', studentName: 'Mohd Farhan bin Yusof', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS1012', studentName: 'Aina Sofea binti Zainal', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-14' },
                    { studentId: 'A23CS1023', studentName: 'Haziq bin Jaafar', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS1034', studentName: 'Nurul Izzah binti Osman', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-13' },
                    { studentId: 'A23CS1045', studentName: 'Wong Jia Hao', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS1056', studentName: 'Siti Zulaikha binti Ismail', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-12' },
                    { studentId: 'A23CS1067', studentName: 'Lee Wei Jie', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-11' },
                    { studentId: 'A23CS1078', studentName: 'Nur Fatin binti Hashim', courseCode: 'SECPH', courseName: 'Data Engineering', submittedDate: '2026-01-11' }
                ]
            };

            return { summary, registrations };
        });

        // Get activity log
        this.on('getActivityLog', async (req) => {
            // Default sample activities (shown if no login has been recorded yet)
            const sampleActivities = [
                { type: 'settings', user: 'System Administrator', action: 'Updated system settings', time: '2026-01-17T16:30:00', icon: 'settings' },
                { type: 'approve', user: 'System Administrator', action: 'Batch approved 15 registrations for SECRH', time: '2026-01-17T15:45:00', icon: 'check' },
                { type: 'export', user: 'System Administrator', action: 'Exported registration report', time: '2026-01-17T14:20:00', icon: 'download' }
            ];

            // Combine real activities with sample ones
            return [...activityLog, ...sampleActivities];
        });

        // Get settings
        this.on('getSettings', async (req) => {
            return systemSettings;
        });

        // Save settings
        this.on('saveSettings', async (req) => {
            const data = req.data;

            // Update settings
            systemSettings = {
                semester: data.semester,
                startDate: data.startDate,
                endDate: data.endDate,
                registrationOpen: data.registrationOpen,
                maxCreditHours: data.maxCreditHours,
                minCreditHours: data.minCreditHours,
                requireAaApproval: data.requireAaApproval,
                emailNewRegistrations: data.emailNewRegistrations,
                emailApprovals: data.emailApprovals,
                dailySummary: data.dailySummary
            };

            // Record activity
            activityLog.unshift({
                type: 'settings',
                user: 'System Administrator',
                action: 'Updated system settings',
                time: new Date().toISOString(),
                icon: 'settings'
            });

            return { success: true, message: 'Settings saved successfully' };
        });

        await super.init();

        // Seed database with admin user if empty (after tables are created)
        try {
            const { Admins } = this.entities;
            const existingAdmin = await SELECT.one.from(Admins);
            if (!existingAdmin) {
                console.log('Seeding database with admin user...');
                await INSERT.into(Admins).entries({
                    ID: 'd1e2f3g4-1111-2222-3333-444455556666',
                    username: 'admin',
                    password: 'admin123',
                    name: 'System Administrator'
                });
                console.log('Admin user created successfully!');
            }
        } catch (err) {
            console.log('Note: Could not seed admin user:', err.message);
        }
    }
};

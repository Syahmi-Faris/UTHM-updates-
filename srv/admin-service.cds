using { uthm.scr as db } from '../db/schema';

service AdminService @(path: '/api/admin') {
    
    // Expose entities for dashboard
    entity Students as projection on db.Students;
    entity Courses as projection on db.Courses;
    entity Registrations as projection on db.Registrations;
    entity Admins as projection on db.Admins;
    
    // Login action
    action login(username: String, password: String) returns {
        success: Boolean;
        message: String;
        adminName: String;
    };
    
    // Dashboard statistics function
    function getDashboardStats() returns {
        totalStudents: Integer;
        totalCourses: Integer;
        totalRegistrations: Integer;
        pendingRegistrations: Integer;
    };
    
    // Chart data: Students per course
    function getStudentsPerCourse() returns array of {
        courseName: String;
        courseCode: String;
        studentCount: Integer;
    };
    
    // Chart data: Faculty of Computing enrollment trends
    function getEnrollmentTrend(yearsBack: Integer) returns array of {
        year: Integer;
        studentCount: Integer;
    };
    
    // Chart data: Registration status per course
    function getRegistrationStatus() returns array of {
        courseCode: String;
        courseName: String;
        registered: Integer;
        notRegistered: Integer;
    };
    
    // Get pending registrations summary and list
    function getPendingRegistrations() returns {
        summary: array of {
            courseCode: String;
            courseName: String;
            pendingCount: Integer;
        };
        registrations: array of {
            studentId: String;
            studentName: String;
            courseCode: String;
            courseName: String;
            submittedDate: String;
        };
    };
    
    // Get activity log
    function getActivityLog() returns array of {
        type: String;
        user: String;
        action: String;
        time: String;
        icon: String;
    };
    
    // Get settings
    function getSettings() returns {
        semester: String;
        startDate: String;
        endDate: String;
        registrationOpen: Boolean;
        maxCreditHours: Integer;
        minCreditHours: Integer;
        requireAaApproval: Boolean;
        emailNewRegistrations: Boolean;
        emailApprovals: Boolean;
        dailySummary: Boolean;
    };
    
    // Save settings
    action saveSettings(
        semester: String,
        startDate: String,
        endDate: String,
        registrationOpen: Boolean,
        maxCreditHours: Integer,
        minCreditHours: Integer,
        requireAaApproval: Boolean,
        emailNewRegistrations: Boolean,
        emailApprovals: Boolean,
        dailySummary: Boolean
    ) returns { success: Boolean; message: String; };
}

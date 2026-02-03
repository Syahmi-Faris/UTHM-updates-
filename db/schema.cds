namespace uthm.scr;

// Students entity
entity Students {
    key ID             : UUID;
        matricNumber   : String(20) not null;
        name           : String(100) not null;
        email          : String(100);
        faculty        : String(100);
        enrollmentYear : Integer;
        createdAt      : Timestamp @cds.on.insert: $now;
}

// Courses entity
entity Courses {
    key ID          : UUID;
        code        : String(20) not null;
        name        : String(100) not null;
        creditHours : Integer;
        semester    : String(20);
        createdAt   : Timestamp @cds.on.insert: $now;
}

// Registrations entity
entity Registrations {
    key ID               : UUID;
        student          : Association to Students;
        course           : Association to Courses;
        status           : String(20) default 'Pending'; // Pending, Approved, Rejected
        registrationDate : Date @cds.on.insert: $now;
}

// Admin users entity
entity Admins {
    key ID       : UUID;
        username : String(50) not null;
        password : String(100) not null;
        name     : String(100);
}

export enum LectureType {
    Normal = "Normal",
    Lab = "Lab",
}

export enum WeekDay {
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday",
    Sunday = "Sunday",
}

export enum ConflictType {
    InstructorBooking = 1,
    StudentBooking = 2,
    RoomBooking = 3,
    RoomCapacity = 4,
    RoomFeature = 5,
    FacultyTravel = 6,
    StudentTravel = 7,
}

export enum CourseType {
    COMMON = "COMMON", // Common Core
    GCE = "GCE", // General Course Electives
    HSE = "HSE", // Humanities and Social Science Electives
    SME = "SME", // Science and Mathematics Electives
    MAE = "MAE",
    OE = "OE", // Open Electives
    PMT = "PMT", // Professional Major Core
    PMP = "PMP", // Professional Major Lab
    PME = "PME", // Professional Major Electives
    PROJECT = "PROJECT",
}

export enum Departments {
    CSE = "CSE",
    EE = "EE",
    ME = "ME",
    CE = "CE",
    GCE = "GCE",
    SME = "SME",
    HSE = "HSE",
    MAE = "MAE",
    GENERAL = "GENERAL",
}

export enum UserRole {
    Admin = "Admin",
    Coordinator = "Coordinator",
    Guest = "Guest",
}

export enum AlgorithmStatus {
    UNEXECUTED = "UNEXECUTED",
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

export enum AlgorithmID {
    EXECUTE_GEN1 = "EXECUTE_GEN1",
    EXECUTE_GEN2 = "EXECUTE_GEN2",
    EXECUTE_SA = "EXECUTE_SA",
}

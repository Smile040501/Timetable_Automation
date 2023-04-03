import Course from "../../models/course";
import Faculty from "../../models/faculty";
import { roomCapacities } from "./rooms";

const coursesAsTXT = [
    "PHY1 | Physics | COMMON | Normal | GENERAL | 2-1-0-3 | Soham Manni-Bibhu Sarangi-Moumita Nandy",
    "LAS1 | Linear Algebra and Series | COMMON | Normal | GENERAL | 3-1-0-4 | Sarath Sasi-V Muruganandam-S H Kulkarni",
    "EE1 | Ecology and Environment | COMMON | Normal | GENERAL | 2-0-0-2 | Athira P-Sarmistha Singh-Deepak Jaiswal-Praveena G",
    "CY1040 | Basic Chemistry for Engineers | COMMON | Normal | GENERAL | 2-1-0-3 | Rositha Kuniyil-Umadevi D-Supratik Sen Mojumdar",
    "MA1021 | Multivariable Calculus | COMMON | Normal | GENERAL | 3-1-0-4 | Lakshmi Sankar-Arpan Kabiraj-Parangama Sarkar",
    "HS1010 | Technology and Society | COMMON | Normal | GENERAL | 2-0-0-2 | Reenu Punnoose",
    "CE1020 | Engineering Mechanics | COMMON | Normal | GENERAL | 3-1-0-4 | Sovan Lal Das-Sanjukta Chakraborty-Arun C O",
    "ID1110 | Introduction to Programming | COMMON | Lab | GENERAL | 2-0-3-4 | Albert Sunny-Srimanta Bhattacharya-Sovan Lal Das-Piyush P. Kurur",
    "HS2000 | Professional Ethics | COMMON | Normal | GENERAL | 2-0-0-2 | Anoop George",
    "HS2031 | Principles of Economics | HSE | Normal | HSE | 3-0-0-3 | Amrita Roy",
    "HS2XXX | Psychology and Life | HSE | Normal | HSE | 3-0-0-3 | Sudarshan Kottai",
    "HS2302 | French A1.1 | HSE | Normal | HSE | 3-0-0-3 | Reenu Punnoose",
    "MA2032 | Numerical Analysis | MAE | Normal | MAE | 3-0-0-3 | HVR Mittal",
    "MA2040 | Probability and Statistics | MAE | Normal | MAE | 3-0-0-3 | Ashok Kumar-S H Kulkarni",
    "HS4605 | Foundations of Linguistics | GCE | Normal | GCE | 3-0-0-3 | Reenu Punnoose",
    "HS4606 | Media, Identity and the Self | GCE | Normal | GCE | 3-0-0-3 | Sujatha G",
    "HS5004 | Econometrics | GCE | Normal | GCE | 3-0-0-3 | Amrita Roy",
    "CY3601 | Electrochemistry and Corrosions | GCE | Normal | GCE | 3-0-0-3 | Yugendar Kotagiri",
    "CS5625 | Software Product Management | GCE | Normal | GCE | 3-0-0-3 | Haragopal Mangipudi",
    "ES5601 | Sustainability Analysis and Design | GCE | Normal | GCE | 3-0-0-3 | Sunitha K Nayar",
    "BSXXXX | Fundamentals of Nanobiotechnology | GCE | Normal | GCE | 3-0-0-3 | Abdul Rasheed P",
    "PH3601 | Quantum Mechanics for Engineers | GCE | Normal | GCE | 3-0-0-3 | Projjwal Banerjee",
    "PH4601 | Magnetic Materials and its Applications | GCE | Normal | GCE | 3-0-0-3 | Soham Manni",
    "CE2020 | Structural Analysis | PMT | Normal | CE | 3-1-0-4 | Madhu Karthik M",
    "CE2040 | Hydraulic Engineering | PMT | Normal | CE | 3-1-0-4 | Athira P",
    "CE2060 | Geology and Soil Mechanics | PMT | Normal | CE | 3-1-0-4 | Divya P. V.",
    "CE2080 | Surveying Theory | PMT | Normal | CE | 3-0-0-3 | Subhasis Mitra",
    "CE2180 | Surveying Practical | PMP | Lab | CE | 0-0-3-2 | Subhasis Mitra",
    "CE3020 | Traffic Engineering | PMT | Normal | CE | 3-0-2-4 | B. K. Bhavathrathan",
    "CE3040 | Basic Structural Steel Design | PMT | Normal | CE | 3-1-0-4 | M.V.Anil Kumar",
    "CE3060 | Estimation & Construction Management | PMT | Normal | CE | 3-1-0-4 | V. Senthilkumar",
    "CE3080 | Hydraulic and Environmental Engineering Laboratory | PMP | Lab | CE | 0-0-3-2 | Praveena G-Sarmistha Singh",
    "CE5510 | Advanced Concrete Technology | PME | Normal | CE | 3-0-0-3 | Sunitha K Nayar",
    "CE5011 | Finite Element Applications | PME | Normal | CE | 3-1-0-4 | Gokulnath C",
    "CE5003 | Introduction to GIS and Remote Sensing | PME | Normal | CE | 1-0-3-3 | Sarmistha Singh",
    "CE4512 | Airport and Railway Engineering | PME | Normal | CE | 3-0-0-3 | Veena Venudharan",
    "CE5514 | Surface Water Hydrology | PME | Normal | CE | 3-0-0-3 | Athira P-Sarmistha Singh",
    "ME5631 | Object-Oriented Numerical Analysis | PME | Normal | CE | 3-0-0-3 | S D Rajan-Samarjeet Chanda",
    "CE5515 | Advanced Mechanics of Structures | PME | Normal | CE | 3-0-0-3 | Arun C O-Gokulnath C",
    "CE5614 | Pavement Analysis & Design | PME | Normal | CE | 3-0-0-3 | Veena Venudharan",
    "CE5002 | Applied soil mechanics | PME | Normal | CE | 3-1-0-4 | Rakesh J Pillai",
    "CE5006 | Foundation Engineering | PME | Normal | CE | 3-1-0-4 | Sudheesh T. K.",
    "CE5615 | Finite ELement Methods in Geotechnical Engineering | PME | Normal | CE | 3-0-0-3 | Gokulnath C-Rakesh J Pillai",
    "CE5XXX | Rock Engineering | PME | Normal | CE | 3-0-0-3 | Ankesh Kumar",
    "CS2020 | Discrete Mathematics for Computer Science | PMT | Normal | CSE | 3-0-0-3 | Jasine Babu",
    "CS2040 | Design and Analysis of Algorithms | PMT | Normal | CSE | 3-1-0-4 | Krithika Ramaswamy",
    "CS2060 | Computer Organisation | PMT | Normal | CSE | 3-0-0-3 | Vivek Chaturvedi",
    "CS2080 | Artificial Intelligence | PMT | Normal | CSE | 3-0-0-3 | Narayanan C K",
    "CS2160 | Computer Organisation Laboratory | PMP | Lab | CSE | 0-0-3-2 | Vivek Chaturvedi",
    "CS2180 | Artificial Intelligence Laboratory | PMP | Lab | CSE | 0-0-3-2 | Krithika Ramaswamy-Dinesh K",
    "CS3020 | Database Management Systems | PMT | Normal | CSE | 3-0-0-3 | Koninika Pal",
    "CS3040 | Compiler Design | PMT | Normal | CSE | 3-0-0-3 | Unnikrishnan C",
    "CS3120 | Database management system Laboratory | PMP | Lab | CSE | 0-0-3-2 | Koninika Pal-Sahely Bhadra",
    "CS3140 | Compiler Design Laboratory | PMP | Lab | CSE | 0-0-3-2 | Unnikrishnan C",
    "CS5016 | Computational Methods and Applications | PME | Normal | CSE | 2-0-3-4 | Albert Sunny",
    "CS5014 | Foundations of Data Science and Machine Learning | PME | Normal | CSE | 3-0-0-3 | Deepak Rajendraprasad",
    "CS5616 | Computational Complexity | PME | Normal | CSE | 3-0-0-3 | Krishnamoorthy Dinesh",
    "CS5820 | Probability and Computing | PME | Normal | CSE | 3-0-0-3 | Deepak Rajendraprasad",
    "CS5XXX | Computational Algebra and Number Theory | PME | Normal | CSE | 3-0-0-3 | Piyush P. Kurur",
    "DS5604 | Responsible Artificial Intelligence | PME | Normal | CSE | 3-0-0-3 | Sahely Bhadra",
    "DS5102 | Big Data Lab | PME | Lab | CSE | 1-0-3-3 | Satyajit Das",
    "CS5619 | Synthesis of Digital Systems | PME | Normal | CSE | 3-0-0-3 | Sandeep Chandran",
    "DSXXXX | Probabilistic Graphical Models | PME | Normal | CSE | 3-0-0-3 | Narayanan C K",
    "CS5010 | Graph Theory and Combinatorics | PME | Normal | CSE | 3-0-0-3 | Srimanta Bhattacharya",
    "EE2020 | Electrical Machines | PMT | Normal | EE | 3-1-0-4 | Arun Rahul S",
    "EE2040 | Analog Circuits Theory | PMT | Normal | EE | 3-1-0-4 | Arvind Ajoy",
    "EE2060 | Engineering Electromagnetics | PMT | Normal | EE | 2-1-0-3 | Sukomal Dey",
    "EE2080 | Microprocessor Systems Design and Interfacing | PMT | Normal | EE | 3-0-2-4 | Mahesh R Panicker",
    "EE2160 | CAD Lab | PMP | Lab | EE | 0-0-3-2 | Swaroop Sahoo-Jobin Francis",
    "EE3020 | Digital Signal Processing | PMT | Normal | EE | 3-1-0-4 | M Sabarimalai Manikandan",
    "EE3040 | Power Systems | PMT | Normal | EE | 3-1-0-4 | Manas Kumar Jena",
    "EE3060 | Control Engineering | PMT | Normal | EE | 3-1-0-4 | Shaikshavali Chitraganti",
    "EE3120 | Communication Systems and Microwave Laboratory | PMP | Lab | EE |0-0-3-2 | Nikhil Krishnan M-Swaroop Sahoo",
    "EE3140 | Measurements and Instrumentation Laboratory | PMP | Lab | EE | 0-0-3-2 | Sreenath Vijayakumar",
    "EE5518 | Nanoelectronic Devices | PME | Normal | EE | 3-0-0-3 | Revathy Padmanabhan",
    "EE5525 | Sensors and Signal Conditioning Circuits | PME | Normal | EE | 3-0-0-3 | Sreenath Vijayakumar",
    "EE5516 | VLSI Architectures for Signal Processing and Machine Learning | PME | Normal | EE | 2-0-2-3 | Subrahmanyam Mula",
    "EE5515 | Control of Nonlinear Dynamical Systems | PME | Normal | EE | 3-0-0-3 | Sneha Gajbhiye",
    "EE5519 | Wireless Communications | PME | Normal | EE | 3-0-0-3 | Jobin Francis",
    "EE5XXX | Error-Correcting Codes for Communications and Distributed Systems | PME | Normal | EE | 3-0-0-3 | Nikhil Krishnan M",
    "EE55XX | Micro/Nanoelectronic Devices Laboratory | PME | Lab | EE | 0-0-3-2 | Revathy Padmanabhan",
    "EE5015 | Power Converters - modulation, control and applications | PME | Normal | EE | 3-0-0-3 | Anirudh Guha",
    "EE6001 | Design of Analog Circuits and Systems | PME | Normal | EE | 3-1-0-4 | Arvind Ajoy",
    "EE5523 | Electric Drives | PME | Normal | EE | 3-0-0-3 | Arun Rahul S",
    "EE5530 | Principles of SoC Functional Verification | PME | Normal | EE | 3-0-0-3 | Subrahmanyam Mula",
    "EE555X | Allied topics in Control | PME | Normal | EE | 3-0-0-3 | Vijay Muralidharan",
    "ME2020 | Gas Dynamics | PMT | Normal | ME | 2-1-0-3 | Ganesh Natarajan",
    "ME2040 | Machine Drawing Practice | PMP | Lab | ME | 1-0-3-4 | Pramod Kuntikana-Krishna Seshagiri",
    "ME2060 | Kinematics and Dynamics of Machinery | PMT | Normal | ME | 3-1-0-4 | Santhakumar Mohan",
    "ME2080 | Engineering Materials | PMT | Normal | ME | 3-1-0-4 | Afzaal Ahmed",
    "ME2140 | Applied Mechanics Laboratory | PMP | Lab | ME | 0-0-3-2 | Krishna Seshagiri",
    "ME3020 | Applied Thermo-Fluids Engineering | PMT | Normal | ME | 3-1-0-4 | Anand T N C",
    "ME3040 | Mechanical Vibrations | PMT | Normal | ME | 3-0-0-3 | Anoop Akkoorath Mana",
    "ME3060 | Machine Design Practice | PMT | Normal | ME | 3-0-0-3 | KVN Surendra",
    "ME3080 | Automation in Manufacturing | PMT | Normal | ME | 3-0-0-3 | Chakradhar Dupadu",
    "ME3180 | Mechanical Engineering Laboratory 2 | PMP | Lab | ME | 0-0-3-2 | Buchibabu V",
    "ME5617 | Wheeled Mobile Robots | PME | Normal | ME | 3-0-0-3 | Santhakumar Mohan",
    "ME4502 | Aerospace Propulsion | PME | Normal | ME | 3-0-0-3 | T Sundararajan",
    "ME5001 | Fracture Mechanics | PME | Normal | ME | 3-0-0-3 | KVN Surendra",
    "ME5610 | Soft Computing | PME | Normal | ME | 3-0-0-3 | D Chakradhar-Samarjeet Chanda",
    "ME5620 | Advanced Heat Transfer | PME | Normal | ME | 3-0-0-3 | Samarjeet Chanda",
    "ME5619 | Combustion | PME | Normal | ME | 3-0-0-3 | Krishna Seshagiri",
    "ME5631 | Object-Oriented Numerical Analysis | PME | Normal | ME | 3-0-0-3 | S D Rajan-Samarjeet Chanda",
    "ME5628 | Lean Manufacturing | PME | Normal | ME | 3-0-0-3 | D Chakradhar-Girish Govande",
    "CY5002 | Chemistry of Materials | PMT | Normal | DS | 3-0-0-3 | Dinesh Jagadeesan",
    "CY5004 | Molecular Dynamics and Basic Statistical Thermodynamics | PMT | Normal | DS | 3-0-0-3 | Debarati Chatterjee",
    "CY5006 | Elucidation of Molecular Structure | PMT | Normal | DS | 3-0-0-3 | Shanmugaraju Sankarasekaran",
    "CY5008 | Reaction Mechanisms | PMT | Normal | DS | 3-0-0-3 | Mintu Porel",
    "CY5102 | Synthesis, Energetics and Dynamics Lab 2 | PMP | Lab | DS | 0-0-3-2 | Dinesh Jagadeesan",
    "CY5104 | Synthesis, Energetics and Dynamics Lab 3 | PMP | Lab | DS | 0-0-3-2 | Mintu Porel",
];

type CoursesAsObject = {
    code: string;
    name: string;
    courseType: string;
    lectureType: string;
    department: string;
    credits: string;
    faculties: string;
};

const getCoursesAsObject = () => {
    const courses: CoursesAsObject[] = [];
    for (const courseStr of coursesAsTXT) {
        const courseFields = courseStr.split("|").map((str) => str.trim());
        courses.push({
            code: courseFields[0],
            name: courseFields[1],
            courseType: courseFields[2],
            lectureType: courseFields[3],
            department: courseFields[4],
            credits: courseFields[5],
            faculties: courseFields[6].split("-").join(", "),
        });
    }
    return courses;
};

export const generateCourses = (
    coursesAsObject: CoursesAsObject[] = getCoursesAsObject()
): [Course[], Faculty[]] => {
    const courses: Course[] = [];
    const faculties: Faculty[] = [];

    let facultyID = 1;
    for (let i = 0; i < coursesAsObject.length; ++i) {
        const courseInfo = coursesAsObject[i];

        const courseFaculties: Faculty[] = [];
        for (const facultyName of courseInfo.faculties.split(", ")) {
            let faculty = faculties.find((fac) => fac.name === facultyName);
            if (!faculty) {
                faculty = new Faculty(facultyID, facultyName);
                faculties.push(faculty);
                ++facultyID;
            }
            courseFaculties.push(faculty);
        }

        const courseCode = courseInfo.code,
            courseName = courseInfo.name,
            courseCredits = courseInfo.credits.split("-").map((s) => +s) as [
                number,
                number,
                number,
                number
            ],
            courseType = courseInfo.courseType,
            courseLectureType = courseInfo.lectureType,
            courseMaxStudents =
                courseInfo.lectureType === "Lab"
                    ? roomCapacities[roomCapacities.length - 1]
                    : roomCapacities[0],
            courseDept = courseInfo.department;

        courses.push(
            new Course(
                i + 1,
                courseCode,
                courseName,
                courseCredits,
                courseType,
                courseLectureType,
                courseMaxStudents,
                courseFaculties,
                courseDept
            )
        );
    }

    return [courses, faculties];
};

export const MOCK_RESUME_DATA = {
    personalInfo: {
        name: "ALEXANDER MORGAN",
        title: "SENIOR SOFTWARE ENGINEER",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 123-4567",
        city: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexmorgan",
        website: "alexmorgan.dev"
    },
    summary: "Innovative and results-driven Senior Software Engineer with over 6 years of experience in full-stack development. Proven track record of delivering scalable web applications and optimizing system performance. Adept at leading cross-functional teams and implementing modern agile methodologies to drive project success.",
    workExperience: [
        {
            id: "work1",
            role: "Senior Full Stack Developer",
            company: "TechNova Solutions",
            startDate: "2021",
            endDate: "Present",
            responsibilities: [
                "Architected and launched a cloud-native SaaS platform serving 50k+ daily users, improving system uptime by 99.9%.",
                "Led a team of 8 developers in migrating a legacy monolith to a microservices architecture using Node.js and Kubernetes.",
                "Optimized database queries, reducing API response times by 40%."
            ]
        },
        {
            id: "work2",
            role: "Software Engineer",
            company: "Creative Pulse Agency",
            startDate: "2018",
            endDate: "2021",
            responsibilities: [
                "Developed dynamic, responsive user interfaces for high-profile clients using React and Redux.",
                "Collaborated with UX/UI designers to translate wireframes into pixel-perfect code.",
                "Implemented CI/CD pipelines that reduced deployment cycles from 2 days to 4 hours."
            ]
        }
    ],
    education: [
        {
            id: "edu1",
            university: "University of California, Berkeley",
            degree: "Bachelor of Science in Computer Science",
            graduationDate: "2018"
        }
    ],
    skills: {
        categories: [
            {
                name: "Languages & Frameworks",
                skills: ["JavaScript (ES6+)", "TypeScript", "React", "Node.js", "Python", "SQL"]
            },
            {
                name: "Tools & Platforms",
                skills: ["AWS", "Docker", "Kubernetes", "Git", "Jira", "Figma"]
            }
        ]
    },
    projects: [
        {
            id: "proj1",
            title: "E-Commerce Analytics Dashboard",
            startDate: "2022",
            endDate: "2023",
            descriptions: [
                "Built a real-time analytics dashboard for e-commerce vendors to track sales and user demographics.",
                "Integrated Stripe API for seamless payment processing and financial reporting.",
                "Utilized D3.js for interactive data visualization."
            ]
        }
    ],
    certifications: [
        {
            id: "cert1",
            name: "AWS Certified Solutions Architect",
            institution: "Amazon Web Services",
            date: "2023"
        }
    ],
    achievements: [
        {
            id: "ach1",
            name: "Employee of the Year 2022",
            date: "TechNova Solutions"
        }
    ],
    references: [],
    referencesHidden: true
};

export const EMPTY_RESUME_DATA = {
    personalInfo: {
        name: "",
        title: "",
        email: "",
        phone: "",
        city: "",
        linkedin: "",
        website: "",
        photo: null
    },
    summary: "",
    workExperience: [],
    education: [],
    skills: {
        categories: [
            { name: "Skills", skills: [] }
        ]
    },
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    volunteering: [],
    references: [],
    referencesHidden: true
};

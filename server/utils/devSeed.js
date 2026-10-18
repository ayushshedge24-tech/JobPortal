const User = require("../models/User");
const Job = require("../models/Job");
const CandidateProfile = require("../models/CandidateProfile");
const CompanyProfile = require("../models/CompanyProfile");

/**
 * Idempotent Development Seed Provisioner
 * Strictly runs in non-production environments to provision documented demo accounts
 * with real bcrypt hashes and real roles. Never deletes, overwrites, or alters user data.
 */
async function seedDevEnvironment() {
  if (process.env.NODE_ENV === "production") return;

  try {
    // 1. Ensure Demo Admin
    let adminUser = await User.findOne({ email: "admin@jobportal.in" });
    if (!adminUser) {
      const passwordHash = await User.hashPassword("password123");
      adminUser = await User.create({
        name: "Ayush Shedge",
        email: "admin@jobportal.in",
        passwordHash,
        role: "ADMIN",
        isActive: true,
        isVerified: true,
      });
      console.log("🌱 Development Demo Admin provisioned: admin@jobportal.in");
    } else if (adminUser.role !== "ADMIN") {
      adminUser.role = "ADMIN";
      await adminUser.save();
    }

    // 2. Ensure Demo Recruiter
    let recruiterUser = await User.findOne({ email: "recruiter@jobportal.in" });
    if (!recruiterUser) {
      const passwordHash = await User.hashPassword("password123");
      recruiterUser = await User.create({
        name: "Priya Deshmukh",
        email: "recruiter@jobportal.in",
        passwordHash,
        role: "RECRUITER",
        isActive: true,
        isVerified: true,
      });
      console.log("🌱 Development Demo Recruiter provisioned: recruiter@jobportal.in");

      // Provision company profile
      await CompanyProfile.findOneAndUpdate(
        { user: recruiterUser._id },
        {
          $setOnInsert: {
            user: recruiterUser._id,
            companyName: "Razorpay Technologies",
            tagline: "India's Leading Financial Services and Payments Infrastructure",
            description: "Razorpay powers digital payments for millions of businesses across India with modern microservices.",
            industry: "Financial Technology",
            companySize: "1000-5000",
            location: "Bangalore (Koramangala), India",
            website: "https://razorpay.com",
            socialLinks: { linkedin: "https://linkedin.com/company/razorpay" },
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    // 3. Ensure Demo Candidate
    let candidateUser = await User.findOne({ email: "candidate@jobportal.in" });
    if (!candidateUser) {
      const passwordHash = await User.hashPassword("password123");
      candidateUser = await User.create({
        name: "Rahul Sharma",
        email: "candidate@jobportal.in",
        passwordHash,
        role: "JOB_SEEKER",
        isActive: true,
        isVerified: true,
      });
      console.log("🌱 Development Demo Candidate provisioned: candidate@jobportal.in");

      // Provision candidate profile
      await CandidateProfile.findOneAndUpdate(
        { user: candidateUser._id },
        {
          $setOnInsert: {
            user: candidateUser._id,
            firstName: "Rahul",
            lastName: "Sharma",
            headline: "Full Stack MERN Developer | React & Node.js Engineer",
            professionalSummary: "Passionate full-stack software engineer with hands-on experience building performant web applications using React, Node.js, Express, and MongoDB.",
            phone: "+91 98765 43210",
            location: "Pune, Maharashtra, India",
            city: "Pune",
            state: "Maharashtra",
            preferredLocations: ["Pune", "Bangalore", "Mumbai"],
            preferredWorkModes: ["Hybrid", "Remote"],
            preferredJobTypes: ["Full-time"],
            currentRole: "Software Engineer",
            experienceYears: 3,
            skills: [
              "React",
              "Node.js",
              "JavaScript",
              "MongoDB",
              "Express",
              "TypeScript",
            ],
            experience: [
              {
                company: "Infosys Limited",
                role: "Software Engineer",
                location: "Pune, India",
                startDate: "2023-01",
                endDate: "",
                currentlyWorking: true,
                description: "Developed and maintained full-stack web features using React, Node.js, and MongoDB.",
              },
            ],
            education: [
              {
                institution: "Pune Institute of Computer Technology",
                degree: "Bachelor of Engineering",
                fieldOfStudy: "Computer Science",
                startDate: "2019",
                endDate: "2023",
                grade: "8.8 CGPA",
              },
            ],
            completionPercentage: 85,
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    // 4. Ensure initial published jobs if database has 0 jobs
    const jobCount = await Job.countDocuments();
    if (jobCount === 0 && recruiterUser) {
      const initialJobs = [
        {
          title: "Senior Full Stack Engineer (MERN)",
          company: "Razorpay Technologies",
          location: "Bangalore (Koramangala / Hybrid)",
          workMode: "Hybrid",
          experience: "3-5 years",
          category: "Software Development",
          salary: "₹22 - ₹30 LPA",
          jobType: "Full-time",
          description: "Razorpay is looking for a Senior Full Stack Engineer to scale our core payments infrastructure and merchant dashboard. You will design resilient microservices using React, Node.js, and MongoDB, handling millions of daily UPI and card transactions.",
          skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
          benefits: ["Comprehensive Health Insurance (₹7L Floater)", "Hybrid Work Flexibility", "Annual Learning Budget"],
          postedBy: recruiterUser._id,
          status: "PUBLISHED",
        },
        {
          title: "Lead Frontend React Architect",
          company: "Razorpay Technologies",
          location: "Bangalore (Indiranagar / Hybrid)",
          workMode: "Hybrid",
          experience: "5+ years",
          category: "Software Development",
          salary: "₹28 - ₹38 LPA",
          jobType: "Full-time",
          description: "Join our consumer web platform team. You will lead UI engineering for high-traffic payments applications, optimize web vitals, and craft fluid micro-animations for millions of users.",
          skills: ["React", "TypeScript", "TailwindCSS", "Redux Toolkit", "Web Vitals"],
          benefits: ["Group Health & Term Insurance", "Home Office Setup Reimbursement", "Parental Leaves"],
          postedBy: recruiterUser._id,
          status: "PUBLISHED",
        },
        {
          title: "Backend API Engineer (Node.js)",
          company: "Razorpay Technologies",
          location: "Pune (Hinjewadi Phase 1)",
          workMode: "On-site",
          experience: "2-4 years",
          category: "Software Development",
          salary: "₹18 - ₹26 LPA",
          jobType: "Full-time",
          description: "Build robust distributed backend systems powering merchant settlement and wealth management products. Work with low-latency REST APIs, Redis caching layers, and high-concurrency event pipelines.",
          skills: ["Node.js", "Express", "MongoDB", "Redis", "Docker", "REST APIs"],
          benefits: ["Health Insurance with OPD Coverage", "Annual Performance Bonus", "Certification Support"],
          postedBy: recruiterUser._id,
          status: "PUBLISHED",
        },
        {
          title: "Product UI / UX Designer",
          company: "Razorpay Technologies",
          location: "Bangalore (Koramangala)",
          workMode: "On-site",
          experience: "3-5 years",
          category: "Product UI/UX Design",
          salary: "₹16 - ₹24 LPA",
          jobType: "Full-time",
          description: "Design intuitive and beautiful web and mobile interfaces for our payments gateway and merchant portals. Craft scalable design systems and collaborate with frontend developers.",
          skills: ["Figma", "Design Systems", "Prototyping", "UX Research"],
          benefits: ["Premium Health & Wellness Cover", "MacBook Pro Workstation"],
          postedBy: recruiterUser._id,
          status: "PUBLISHED",
        },
        {
          title: "Junior Web Developer (React / JavaScript)",
          company: "Razorpay Technologies",
          location: "Pune (Magarpatta City)",
          workMode: "Hybrid",
          experience: "1-2 years",
          category: "Software Development",
          salary: "₹6 - ₹9 LPA",
          jobType: "Full-time",
          description: "Seeking a curious junior developer to build modern client portals, application forms, and responsive dashboards with React and modern CSS.",
          skills: ["JavaScript", "React", "HTML5", "CSS3", "Git"],
          benefits: ["Flexible Hours", "Mentorship from Senior Leads"],
          postedBy: recruiterUser._id,
          status: "PUBLISHED",
        },
      ];

      await Job.insertMany(initialJobs);
      console.log(`🌱 Development Initial Jobs provisioned: ${initialJobs.length} published jobs.`);
    }
  } catch (error) {
    console.warn("Dev seed notice:", error.message);
  }
}

module.exports = seedDevEnvironment;

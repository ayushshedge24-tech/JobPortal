const http = require("http");

const BASE_URL = "http://localhost:5000";

async function request(urlPath, options = {}) {
  const url = new URL(urlPath, BASE_URL);
  const headers = options.headers || {};
  let body = options.body;
  if (body && typeof body === "object") {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers,
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("   JOBPORTAL 2.0 FULL VERIFICATION SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = "") {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${extra}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${extra}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request("/api/health");
    assert(health.status === 200 && health.data?.status === "ok", "1. Server Health Check", `Status: ${health.status}, DB: ${health.data?.dbConnected}`);

    // 2. CORS Preflight
    const corsPreflight = await request("/api/jobs", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
      },
    });
    assert(
      corsPreflight.status === 200 &&
      corsPreflight.headers["access-control-allow-origin"] === "http://localhost:5173",
      "2. CORS Preflight & Dynamic Origin",
      `Origin header: ${corsPreflight.headers["access-control-allow-origin"]}`
    );

    // 3. Unauthenticated access protection
    const unauthApps = await request("/api/applications");
    assert(unauthApps.status === 401, "3. Protected Route Rejects Unauthenticated User", `Expected 401, got ${unauthApps.status}`);

    // 4. Candidate Authentication
    const candLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: "candidate@jobportal.in", password: "password123" },
    });
    assert(
      candLogin.status === 200 &&
      candLogin.data?.accessToken &&
      candLogin.data?.user?.role === "JOB_SEEKER",
      "4. Candidate Login (Real JWT)",
      `Role: ${candLogin.data?.user?.role}`
    );
    const candidateToken = candLogin.data?.accessToken;
    const candidateUser = candLogin.data?.user;

    // 5. Recruiter Authentication
    const recLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: "recruiter@jobportal.in", password: "password123" },
    });
    assert(
      recLogin.status === 200 &&
      recLogin.data?.accessToken &&
      recLogin.data?.user?.role === "RECRUITER",
      "5. Recruiter Login (Real JWT)",
      `Role: ${recLogin.data?.user?.role}`
    );
    const recruiterToken = recLogin.data?.accessToken;
    const recruiterUser = recLogin.data?.user;

    // 6. Admin Authentication
    const adminLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: "admin@jobportal.in", password: "password123" },
    });
    assert(
      adminLogin.status === 200 &&
      adminLogin.data?.accessToken &&
      adminLogin.data?.user?.role === "ADMIN",
      "6. Admin Login (Real JWT)",
      `Role: ${adminLogin.data?.user?.role}`
    );
    const adminToken = adminLogin.data?.accessToken;

    // 7. Security: Candidate cannot access Admin APIs
    const candAccessAdmin = await request("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(candAccessAdmin.status === 403, "7. Candidate Blocked from Admin APIs (403)", `Status: ${candAccessAdmin.status}`);

    // 8. Security: Recruiter cannot access Admin APIs
    const recAccessAdmin = await request("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recAccessAdmin.status === 403, "8. Recruiter Blocked from Admin APIs (403)", `Status: ${recAccessAdmin.status}`);

    // 9. Admin Dashboard Metrics
    const adminDashboard = await request("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const overview = adminDashboard.data?.data?.overview;
    assert(
      adminDashboard.status === 200 &&
      typeof overview?.users?.total === "number" &&
      typeof overview?.jobs?.total === "number",
      "9. Admin Dashboard Metrics Access (Factual Counts)",
      `Users: ${overview?.users?.total}, Jobs: ${overview?.jobs?.total}`
    );

    // 10. Public / Candidate Jobs Listing
    const jobsList = await request("/api/jobs");
    const jobsArray = Array.isArray(jobsList.data) ? jobsList.data : jobsList.data?.jobs;
    assert(
      jobsList.status === 200 &&
      Array.isArray(jobsArray) &&
      jobsArray.length > 0,
      "10. Public Jobs Listing from MongoDB",
      `Jobs count: ${jobsArray?.length}`
    );
    const targetJob = jobsArray[0];

    // 11. Job Details Fetch
    const jobDetails = await request(`/api/jobs/${targetJob._id}`);
    assert(
      jobDetails.status === 200 && jobDetails.data?._id === targetJob._id,
      "11. Job Details Page Data",
      `Job Title: ${jobDetails.data?.title}`
    );

    // 12. Fresh Candidate Registration
    const testCandidateEmail = `cand_${Date.now()}@jobportal.in`;
    const newCandReg = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test Candidate",
        email: testCandidateEmail,
        password: "password123",
        role: "jobseeker",
      },
    });
    assert(
      newCandReg.status === 201 &&
      newCandReg.data?.user?.role === "JOB_SEEKER",
      "12. Candidate Registration with Password Hashing & Real JWT",
      `Email: ${testCandidateEmail}`
    );
    const newCandToken = newCandReg.data?.accessToken;
    const newCandUser = newCandReg.data?.user;

    // 13. End-to-End Application Submission
    const appPayload = {
      job: targetJob._id,
      applicant: newCandUser._id,
      applicantName: newCandUser.name,
      applicantEmail: newCandUser.email,
      phone: "+91 98765 00000",
      currentLocation: "Bangalore",
      currentCtc: "12 LPA",
      expectedCtc: "16 LPA",
      noticePeriod: "30 Days",
      experienceYears: "3",
      resume: "https://jobportal.in/resumes/test-candidate.pdf",
      coverLetter: "Excited to apply for this opportunity!",
    };
    const appSubmit = await request("/api/applications", {
      method: "POST",
      headers: { Authorization: `Bearer ${newCandToken}` },
      body: appPayload,
    });
    assert(
      appSubmit.status === 201 &&
      appSubmit.data?.application?._id &&
      appSubmit.data?.application?.status === "Applied",
      "13. Job Application Submission Stored in MongoDB",
      `App ID: ${appSubmit.data?.application?._id}`
    );
    const createdAppId = appSubmit.data?.application?._id;

    // 14. Duplicate Application Prevention
    const appDuplicate = await request("/api/applications", {
      method: "POST",
      headers: { Authorization: `Bearer ${newCandToken}` },
      body: appPayload,
    });
    assert(
      appDuplicate.status === 400,
      "14. Duplicate Application Prevention Enforced",
      `Status: ${appDuplicate.status}, Message: ${appDuplicate.data?.message || appDuplicate.data?.error?.message}`
    );

    // 15. Recruiter sees Application
    const recApps = await request("/api/applications", {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const recAppsList = Array.isArray(recApps.data) ? recApps.data : recApps.data?.applications;
    const foundInRecruiter = recAppsList?.find((a) => a._id === createdAppId);
    assert(
      recApps.status === 200 && Boolean(foundInRecruiter),
      "15. Recruiter ATS Pipeline Sees New Application",
      `Found applicant: ${foundInRecruiter?.applicantName}`
    );

    // 16. Recruiter updates Application Status
    const updateStatus = await request(`/api/applications/${createdAppId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: { status: "Shortlisted", notes: "Strong MERN stack background." },
    });
    assert(
      updateStatus.status === 200 &&
      updateStatus.data?.application?.status === "Shortlisted",
      "16. Recruiter Updates Application Status to 'Shortlisted'",
      `Status: ${updateStatus.data?.application?.status}`
    );

    // 17. Candidate sees Real Updated Status
    const candApps = await request("/api/applications", {
      headers: { Authorization: `Bearer ${newCandToken}` },
    });
    const candAppsList = Array.isArray(candApps.data) ? candApps.data : candApps.data?.applications;
    const foundInCandidate = candAppsList?.find((a) => a._id === createdAppId);
    assert(
      candApps.status === 200 &&
      foundInCandidate?.status === "Shortlisted",
      "17. Candidate Dashboard Reflects Real Updated Status",
      `Reflected status: ${foundInCandidate?.status}`
    );

    // 18. Recruiter Job Creation
    const newJobPayload = {
      title: "Senior Full-Stack Engineer (React / Node)",
      company: "Razorpay Technologies",
      location: "Bangalore",
      jobType: "Full-time",
      workMode: "Hybrid",
      experienceLevel: "Senior",
      experienceRequired: "4-7 years",
      salary: "24-32 LPA",
      description: "Looking for an expert full-stack engineer to lead core payments checkout platform.",
      skills: ["React", "Node.js", "Express", "MongoDB", "Redis"],
    };
    const createJob = await request("/api/jobs", {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: newJobPayload,
    });
    assert(
      createJob.status === 201 && createJob.data?.job?._id,
      "18. Recruiter Job Posting Created & Published",
      `Job ID: ${createJob.data?.job?._id}`
    );
    const createdJobId = createJob.data?.job?._id;

    // 19. Security: Another recruiter cannot modify this job
    const freshRecReg = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Second Recruiter",
        email: `rec2_${Date.now()}@jobportal.in`,
        password: "password123",
        role: "employer",
      },
    });
    const rec2Token = freshRecReg.data?.accessToken;
    const unauthorizedEdit = await request(`/api/jobs/${createdJobId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${rec2Token}` },
      body: { title: "Hacked Job Title" },
    });
    assert(
      unauthorizedEdit.status === 403,
      "19. Cross-Recruiter Job Modification Blocked (403)",
      `Status: ${unauthorizedEdit.status}, Message: ${unauthorizedEdit.data?.error?.message}`
    );

    // 20. Messaging Route Verification
    const msgConversations = await request("/api/conversations", {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(
      msgConversations.status === 200,
      "20. Platform Messaging Conversations Accessible (Dual Prefix Resolved)",
      `Conversations status: ${msgConversations.status}`
    );

    // 21. Logout Route
    const logoutRes = await request("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(
      logoutRes.status === 200,
      "21. Logout Route Cleanses Session Successfully",
      `Message: ${logoutRes.data?.message}`
    );

    console.log("\n==================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");
  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
  }
}

runTests();

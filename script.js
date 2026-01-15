// ===== DOM ELEMENTS =====
const subjectInput = document.getElementById("subject");
const durationInput = document.getElementById("duration");
const addBtn = document.getElementById("addBtn");

const totalTimeEl = document.getElementById("totalTime");
const subjectList = document.getElementById("subjectList");

const weeklyTimeEl = document.getElementById("weeklyTime");
const topSubjectEl = document.getElementById("topSubject");
const consistencyEl = document.getElementById("consistency");

// ===== DATA =====
let studyData = JSON.parse(localStorage.getItem("studyData")) || [];
let chart = null;

// ===== ADD SESSION =====
addBtn.addEventListener("click", () => {
    const subject = subjectInput.value.trim();
    const duration = Number(durationInput.value);

    if (subject === "" || duration <= 0) {
        alert("Please enter valid subject and duration");
        return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    studyData.push({
        subject: subject,
        duration: duration,
        date: dateStr
    });

    localStorage.setItem("studyData", JSON.stringify(studyData));

    subjectInput.value = "";
    durationInput.value = "";

    updateUI();
});

// ===== UPDATE UI =====
function updateUI() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const todayData = studyData.filter(item => item.date === todayStr);

    let total = 0;
    let subjectMap = {};

    todayData.forEach(item => {
        total += item.duration;
        subjectMap[item.subject] =
            (subjectMap[item.subject] || 0) + item.duration;
    });

    totalTimeEl.textContent = `Total Study Time: ${total} minutes`;
    subjectList.innerHTML = "";

    for (let subject in subjectMap) {
        const li = document.createElement("li");
        li.textContent = `${subject}: ${subjectMap[subject]} minutes`;
        subjectList.appendChild(li);
    }

    renderChart(subjectMap);
    updateWeeklyInsights();
}

// ===== WEEKLY INSIGHTS =====
function updateWeeklyInsights() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    let weeklyTotal = 0;
    let subjectMap = {};
    let daysStudied = new Set();

    studyData.forEach(item => {
        const parts = item.date.split("-");
        const itemDate = new Date(parts[0], parts[1] - 1, parts[2]);

        if (itemDate >= weekStart && itemDate <= today) {
            weeklyTotal += item.duration;
            subjectMap[item.subject] =
                (subjectMap[item.subject] || 0) + item.duration;
            daysStudied.add(item.date);
        }
    });

    let topSubject = "-";
    let maxTime = 0;

    for (let subject in subjectMap) {
        if (subjectMap[subject] > maxTime) {
            maxTime = subjectMap[subject];
            topSubject = subject;
        }
    }

    weeklyTimeEl.textContent = `Total This Week: ${weeklyTotal} minutes`;
    topSubjectEl.textContent = `Most Studied Subject: ${topSubject}`;
    consistencyEl.textContent =
        `Consistency: ${Math.round((daysStudied.size / 7) * 100)}%`;
}

// ===== CHART =====
function renderChart(subjectMap) {
    const canvas = document.getElementById("studyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(subjectMap),
            datasets: [
                {
                    label: "Study Time (minutes)",
                    data: Object.values(subjectMap)
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ===== INITIAL LOAD =====
updateUI();

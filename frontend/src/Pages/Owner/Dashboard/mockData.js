// src/components/Dashboard/mockData.js
export const taskSummary = {
    total: 120,
    inProgress: 40,
    completed: 60,
    overdue: 20,
};

export const taskByStatus = [
    { name: "Completed", value: 60 },
    { name: "In Progress", value: 40 },
    { name: "Overdue", value: 20 },
];

export const taskByUser = [
    { name: "Alice", tasks: 25 },
    { name: "Bob", tasks: 18 },
    { name: "Charlie", tasks: 12 },
    { name: "David", tasks: 30 },
];

export const taskTrend = [
    { week: "Week 1", completed: 10 },
    { week: "Week 2", completed: 18 },
    { week: "Week 3", completed: 22 },
    { week: "Week 4", completed: 15 },
];

export const upcomingTasks = [
    { title: "Fix login bug", deadline: "2025-09-01" },
    { title: "Prepare report", deadline: "2025-09-03" },
    { title: "UI review meeting", deadline: "2025-09-05" },
];

export const overdueTasks = [
    { title: "Update API docs", deadline: "2025-08-20" },
    { title: "Refactor dashboard", deadline: "2025-08-25" },
];

let task = {};
let currentUser = null;

function toggleAuth(mode) {
  document.getElementById('login-screen').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('register-screen').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('login-error').textContent = '';
}

function register() {
  const user = document.getElementById('new-username').value.trim();
  const pass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[user]) {
    document.getElementById('login-error').textContent = 'Tài khoản đã tồn tại';
    return;
  }

  if (user.length < 3) {
    document.getElementById('login-error').textContent = 'Tên tài khoản phải từ 3 ký tự trở lên';
    return;
  }

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;
  if (!passRegex.test(pass)) {
    document.getElementById('login-error').textContent =
      'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt';
    return;
  }

  if (pass !== confirm) {
    document.getElementById('login-error').textContent = 'Mật khẩu nhập lại không khớp';
    return;
  }

  users[user] = { password: pass, tasks: {} };
  localStorage.setItem('users', JSON.stringify(users));
  document.getElementById('login-error').textContent = 'Đăng ký thành công, bạn có thể đăng nhập';
  toggleAuth('login');
}

function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[u] && users[u].password === p) {
    currentUser = u;
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    loadTasks();
  } else {
    document.getElementById('login-error').textContent = 'Sai tài khoản hoặc mật khẩu';
  }
}

function logout() {
  currentUser = null;
  document.getElementById('auth-screen').style.display = 'block';
  document.getElementById('app-screen').style.display = 'none';
}

function addTask(event) {
  event.preventDefault();
  const content = document.getElementById('task-input').value;
  const priorityMap = { high: 3, medium: 2, low: 1 };
  const priority = priorityMap[document.getElementById('priority-select').value];
  const taskDate = document.getElementById('task-date').value;

  if (!taskDate) {
    alert("Vui lòng chọn ngày");
    return;
  }

  const users = JSON.parse(localStorage.getItem('users'));
  if (!users[currentUser].tasks[taskDate]) {
    users[currentUser].tasks[taskDate] = [];
  }

  users[currentUser].tasks[taskDate].push({ content, priority, completed: false });
  localStorage.setItem('users', JSON.stringify(users));
  document.getElementById('task-input').value = '';
  loadTasks();
}

function toggleTaskCompleted(date, index) {
  const users = JSON.parse(localStorage.getItem('users'));
  const tasks = users[currentUser].tasks[date];
  tasks[index].completed = !tasks[index].completed;
  localStorage.setItem('users', JSON.stringify(users));
  loadTasks();
}

function loadTasks() {
  const taskDate = document.getElementById('task-date').value;
  if (!taskDate) return;

  const users = JSON.parse(localStorage.getItem('users')) || {};
  const originTasks = users[currentUser]?.tasks?.[taskDate] || [];
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (originTasks.length === 0) {
    list.innerHTML = '<li>Không có công việc cho ngày này.</li>';
    return;
  }

  const tasksWithIndex = originTasks.map((task, i) => ({ ...task, originalIndex: i }));
  tasksWithIndex.sort((a, b) => b.priority - a.priority);
  const priorityTextMap = { 3: 'Cao', 2: 'Trung bình', 1: 'Thấp' };

  tasksWithIndex.forEach((task) => {
    const li = document.createElement('li');
    li.className = task.priority === 3 ? 'high' : task.priority === 2 ? 'medium' : 'low';
    if (task.completed) li.classList.add('completed');

    const text = document.createElement('span');
    text.textContent = `${task.content} (Ưu tiên: ${priorityTextMap[task.priority]})`;
    text.className = task.completed ? 'completed-text' : '';

    const rightIcons = document.createElement('div');
    rightIcons.className = 'task-icons';

    const checkboxIcon = document.createElement('i');
    checkboxIcon.className = task.completed ? 'fa-regular fa-square-check' : 'fa-regular fa-square';
    checkboxIcon.onclick = () => toggleTaskCompleted(taskDate, task.originalIndex);
    rightIcons.appendChild(checkboxIcon);

    const trashBtn = document.createElement('i');
    trashBtn.className = 'fa-solid fa-trash';
    trashBtn.onclick = () => {
      originTasks.splice(task.originalIndex, 1);
      users[currentUser].tasks[taskDate] = originTasks;
      localStorage.setItem('users', JSON.stringify(users));
      loadTasks();
    };
    rightIcons.appendChild(trashBtn);

    li.appendChild(text);
    li.appendChild(rightIcons);
    list.appendChild(li);
  });
}

function showAllTasks() {
  const container = document.getElementById("all-tasks-list");
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (!currentUser || !users[currentUser] || !users[currentUser].tasks) {
    container.innerHTML = "<p>Không có công việc nào.</p>";
    return;
  }

  container.innerHTML = "";
  const allTasks = users[currentUser].tasks;
  const sortedDates = Object.keys(allTasks).sort();
  const priorityTextMap = { 3: 'Cao', 2: 'Trung bình', 1: 'Thấp' };

  sortedDates.forEach(date => {
    const tasks = [...allTasks[date]].sort((a, b) => b.priority - a.priority);
    const section = document.createElement("div");
    section.innerHTML = `<h3>Ngày ${date}</h3>`;
    const ul = document.createElement("ul");

    tasks.forEach((task, i) => {
      const li = document.createElement("li");
      li.className = task.priority === 3 ? "high" : task.priority === 2 ? "medium" : "low";
      if (task.completed) li.classList.add("completed");

      const span = document.createElement("span");
      span.textContent = `${task.content} (Ưu tiên: ${priorityTextMap[task.priority]})`;
      span.className = task.completed ? 'completed-text' : '';

      const icons = document.createElement("div");
      icons.className = "task-icons";

      const checkbox = document.createElement("i");
      checkbox.className = task.completed ? "fa-regular fa-square-check" : "fa-regular fa-square";
      checkbox.onclick = () => {
        task.completed = !task.completed;
        localStorage.setItem('users', JSON.stringify(users));
        showAllTasks();
      };

      const trash = document.createElement("i");
      trash.className = "fa-solid fa-trash";
      trash.onclick = () => {
        allTasks[date].splice(i, 1);
        if (allTasks[date].length === 0) delete allTasks[date];
        localStorage.setItem('users', JSON.stringify(users));
        showAllTasks();
      };

      icons.appendChild(checkbox);
      icons.appendChild(trash);
      li.appendChild(span);
      li.appendChild(icons);
      ul.appendChild(li);
    });

    section.appendChild(ul);
    container.appendChild(section);
  });
}

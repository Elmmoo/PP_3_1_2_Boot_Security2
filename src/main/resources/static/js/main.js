document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:8080/api';
    const page = window.location.pathname;

    // --- UTILITY FUNCTIONS ---
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    const csrfToken = getCookie('XSRF-TOKEN');
    const headers = {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken
    };

    // --- GENERAL PAGE LOGIC ---
    async function getCurrentUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/current`);
            if (!response.ok) {
                if (response.status === 401 && page !== '/login.html') {
                    window.location.href = '/login.html';
                }
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching current user:', error);
            if (page !== '/login.html') window.location.href = '/login.html';
            return null;
        }
    }

    function updateHeader(user) {
        if (!user) return;
        const emailElem = document.getElementById('header-email');
        const rolesElem = document.getElementById('header-roles');
        if (emailElem && rolesElem) {
            emailElem.textContent = user.username || user.email; // 'username' from Principal, 'email' from DTO
            rolesElem.textContent = user.authorities.map(auth => auth.authority.replace('ROLE_', '')).join(', ');
        }
    }

    function setupLogout() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', headers: {'X-XSRF-TOKEN': csrfToken} });
                window.location.href = '/login.html';
            });
        }
    }

    // --- LOGIN PAGE LOGIC ---
    if (page.includes('/login.html')) {
        const loginForm = document.getElementById('login-form');
        if(loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const errorDiv = document.getElementById('login-error');

                // Spring Security's formLogin expects x-www-form-urlencoded
                const body = new URLSearchParams();
                body.append('username', email); // Spring Security expects 'username' by default
                body.append('password', password);

                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Get fresh token
                    },
                    body: body
                });

                if (response.ok) {
                    const user = await getCurrentUser();
                    if (user.authorities.some(auth => auth.authority === 'ROLE_ADMIN')) {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/user.html';
                    }
                } else {
                    errorDiv.textContent = 'Invalid email or password';
                    errorDiv.style.display = 'block';
                }
            });
        }
    }


    // --- USER PAGE LOGIC ---
    if (page.includes('/user.html')) {
        const userTbody = document.getElementById('user-info-body');

        async function loadUserInfo() {
            const response = await fetch(`${API_BASE_URL}/user`, { headers });
            if (response.ok) {
                const user = await response.json();
                userTbody.innerHTML = `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.firstName}</td>
                        <td>${user.lastName}</td>
                        <td>${user.age}</td>
                        <td>${user.email}</td>
                        <td>${user.roles.map(r => r.replace('ROLE_', '')).join(', ')}</td>
                    </tr>
                `;
            }
        }

        async function setupUserNav(user) {
            const navUl = document.querySelector('.sidebar nav ul');
            if (user.authorities.some(a => a.authority === 'ROLE_ADMIN')) {
                navUl.innerHTML += `<li><a href="/admin.html">Admin</a></li>`;
            }
            navUl.innerHTML += `<li class="active"><a href="/user.html">User</a></li>`;
        }

        (async () => {
            const user = await getCurrentUser();
            if (user) {
                updateHeader(user);
                setupLogout();
                setupUserNav(user);
                await loadUserInfo();
            }
        })();
    }

    // --- ADMIN PAGE LOGIC ---
    if (page.includes('/admin.html')) {
        // Elements
        const usersTbody = document.getElementById('users-table-body');
        const showUsersBtn = document.getElementById('show-users-btn');
        const showAddFormBtn = document.getElementById('show-add-form-btn');
        const usersTableView = document.getElementById('users-table-view');
        const addUserView = document.getElementById('add-user-view');

        // Add Form
        const addUserForm = document.getElementById('add-user-form');
        const addRolesSelect = document.getElementById('add-roles');

        // Edit Modal
        const editModal = document.getElementById('edit-modal');
        const editForm = document.getElementById('edit-user-form');
        const editRolesSelect = document.getElementById('edit-roles');

        // Delete Modal
        const deleteModal = document.getElementById('delete-modal');
        const deleteForm = document.getElementById('delete-user-form');
        const deleteRolesSelect = document.getElementById('delete-roles');

        // --- Data Loading ---
        async function loadAllRoles() {
            const response = await fetch(`${API_BASE_URL}/admin/roles`, { headers });
            const roles = await response.json();

            [addRolesSelect, editRolesSelect, deleteRolesSelect].forEach(select => {
                select.innerHTML = roles.map(role =>
                    `<option value="${role.id}">${role.name.replace('ROLE_', '')}</option>`
                ).join('');
            });
        }

        async function loadAllUsers() {
            const response = await fetch(`${API_BASE_URL}/admin/users`, { headers });
            const users = await response.json();
            usersTbody.innerHTML = users.map(user => `
                <tr data-id="${user.id}">
                    <td>${user.id}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>${user.age}</td>
                    <td>${user.email}</td>
                    <td>${user.roles.map(r => r.replace('ROLE_', '')).join(', ')}</td>
                    <td><button class="btn btn-info edit-btn">Edit</button></td>
                    <td><button class="btn btn-danger delete-btn">Delete</button></td>
                </tr>
            `).join('');
        }

        // --- UI Toggling ---
        function showTab(viewToShow, btnToActivate) {
            [usersTableView, addUserView].forEach(v => v.classList.add('hidden'));
            [showUsersBtn, showAddFormBtn].forEach(b => b.classList.remove('active'));
            viewToShow.classList.remove('hidden');
            btnToActivate.classList.add('active');
        }

        showUsersBtn.addEventListener('click', () => showTab(usersTableView, showUsersBtn));
        showAddFormBtn.addEventListener('click', () => showTab(addUserView, showAddFormBtn));

        // --- CRUD Operations ---
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedRoles = Array.from(addRolesSelect.selectedOptions).map(opt => opt.value);
            const newUser = {
                firstName: document.getElementById('add-firstName').value,
                lastName: document.getElementById('add-lastName').value,
                age: parseInt(document.getElementById('add-age').value),
                email: document.getElementById('add-email').value,
                password: document.getElementById('add-password').value,
                roleIds: selectedRoles
            };

            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(newUser)
            });

            if(response.ok) {
                addUserForm.reset();
                await loadAllUsers();
                showTab(usersTableView, showUsersBtn);
            } else {
                alert('Error creating user.');
            }
        });

        usersTbody.addEventListener('click', async (e) => {
            const userId = e.target.closest('tr').dataset.id;
            if (e.target.classList.contains('edit-btn')) {
                openEditModal(userId);
            }
            if (e.target.classList.contains('delete-btn')) {
                openDeleteModal(userId);
            }
        });

        // --- Modal Logic ---
        function closeModal(modal) {
            modal.classList.add('hidden');
        }

        async function openEditModal(userId) {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, { headers });
            const user = await response.json();

            document.getElementById('edit-id').value = user.id;
            document.getElementById('edit-id-display').value = user.id;
            document.getElementById('edit-firstName').value = user.firstName;
            document.getElementById('edit-lastName').value = user.lastName;
            document.getElementById('edit-age').value = user.age;
            document.getElementById('edit-email').value = user.email;

            const userRoleNames = user.roles.map(r => r.replace('ROLE_',''));
            Array.from(editRolesSelect.options).forEach(option => {
                option.selected = userRoleNames.includes(option.text);
            });

            editModal.classList.remove('hidden');
        }

        async function openDeleteModal(userId) {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, { headers });
            const user = await response.json();

            document.getElementById('delete-id').value = user.id;
            document.getElementById('delete-id-display').value = user.id;
            document.getElementById('delete-firstName').value = user.firstName;
            document.getElementById('delete-lastName').value = user.lastName;
            document.getElementById('delete-age').value = user.age;
            document.getElementById('delete-email').value = user.email;

            const userRoleNames = user.roles.map(r => r.replace('ROLE_',''));
            Array.from(deleteRolesSelect.options).forEach(option => {
                option.selected = userRoleNames.includes(option.text);
            });

            deleteModal.classList.remove('hidden');
        }

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedRoles = Array.from(editRolesSelect.selectedOptions).map(opt => opt.value);
            const password = document.getElementById('edit-password').value;
            const userUpdate = {
                id: document.getElementById('edit-id').value,
                firstName: document.getElementById('edit-firstName').value,
                lastName: document.getElementById('edit-lastName').value,
                age: parseInt(document.getElementById('edit-age').value),
                email: document.getElementById('edit-email').value,
                roleIds: selectedRoles
            };
            // Only include password if it's not empty
            if (password) {
                userUpdate.password = password;
            }

            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(userUpdate)
            });

            if (response.ok) {
                closeModal(editModal);
                await loadAllUsers();
            } else {
                alert('Error updating user.');
            }
        });

        deleteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.getElementById('delete-id').value;
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: headers
            });
            if(response.ok) {
                closeModal(deleteModal);
                await loadAllUsers();
            } else {
                alert('Error deleting user');
            }
        });

        // Modal close buttons
        document.getElementById('edit-close-btn').onclick = () => closeModal(editModal);
        document.getElementById('edit-cancel-btn').onclick = () => closeModal(editModal);
        document.getElementById('delete-close-btn').onclick = () => closeModal(deleteModal);
        document.getElementById('delete-cancel-btn').onclick = () => closeModal(deleteModal);
        window.onclick = (e) => {
            if (e.target === editModal) closeModal(editModal);
            if (e.target === deleteModal) closeModal(deleteModal);
        };

        // --- Initial Load for Admin Page ---
        (async () => {
            const user = await getCurrentUser();
            if (user && user.authorities.some(a => a.authority === 'ROLE_ADMIN')) {
                updateHeader(user);
                setupLogout();
                await loadAllRoles();
                await loadAllUsers();
            } else if (user) {
                // Not an admin but logged in, go to user page
                window.location.href = '/user.html';
            }
            // If user is null, getCurrentUser already redirected
        })();
    }
});
class FabriconixApp {
    constructor() {
        this.currentUser = null;
        this.socket = null;
        this.API_URL = "http://localhost:5000/api";
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showNotification('An error occurred', 'error');
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    checkAuth() {
        const token = localStorage.getItem('fabriconix_token');
        const user = localStorage.getItem('fabriconix_user');
        
        if (token && user) {
            try {
                this.currentUser = JSON.parse(user);
                this.connectSocket();
                this.showDashboard();
            } catch (e) {
                localStorage.clear();
                this.showLandingPage();
            }
        } else {
            this.showLandingPage();
        }
    }

    connectSocket() {
        if (!this.currentUser) return;
        
        this.socket = io('http://localhost:5000');
        
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.socket.emit('join-room', this.currentUser.id);
        });
        
        this.socket.on('receive-message', (message) => {
            console.log('New message:', message);
            this.showNotification(`New message from ${message.sender_id}`, 'info');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }

    showLandingPage() {
        document.getElementById('app').innerHTML = `
            <div class="container">
                <header>
                    <nav>
                        <a href="#" class="logo">
                            <i class="fas fa-cut"></i>
                            <span>Fabriconix</span>
                        </a>
                        <div class="nav-links">
                            <a href="#" onclick="app.showUserSelection()">Get Started</a>
                        </div>
                    </nav>
                </header>

                <main>
                    <section class="hero">
                        <h1>Welcome to Fabriconix</h1>
                        <p>India's Premier Custom Tailoring Platform</p>
                        <button class="btn btn-primary btn-lg" onclick="app.showUserSelection()">
                            <i class="fas fa-play-circle"></i> Get Started
                        </button>
                    </section>

                    <div id="content"></div>
                </main>
            </div>
        `;
    }

    showUserSelection() {
        document.getElementById('content').innerHTML = `
            <div style="text-align: center; margin: 3rem 0;">
                <h2 style="margin-bottom: 1rem;">Select Your Role</h2>
                <p style="color: #64748b; margin-bottom: 2rem;">Choose how you want to use Fabriconix</p>
                
                <div class="user-selection">
                    <div class="user-card" onclick="app.selectRole('customer')">
                        <i class="fas fa-user"></i>
                        <h3>Customer</h3>
                        <p>Order custom tailored clothes</p>
                    </div>
                    
                    <div class="user-card" onclick="app.selectRole('tailor')">
                        <i class="fas fa-scissors"></i>
                        <h3>Tailor</h3>
                        <p>Manage orders and customers</p>
                    </div>
                    
                    <div class="user-card" onclick="app.selectRole('vendor')">
                        <i class="fas fa-store"></i>
                        <h3>Vendor</h3>
                        <p>Supply raw materials</p>
                    </div>
                    
                    <div class="user-card" onclick="app.selectRole('delivery')">
                        <i class="fas fa-truck"></i>
                        <h3>Delivery Agent</h3>
                        <p>Manage deliveries</p>
                    </div>
                </div>
            </div>
        `;
    }

    selectRole(role) {
        this.selectedRole = role;
        this.showAuthForms();
    }

    showAuthForms() {
        document.getElementById('content').innerHTML = `
            <div class="auth-container">
                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="app.showAuthTab('login')">Login</button>
                    <button class="auth-tab" onclick="app.showAuthTab('register')">Register</button>
                </div>
                
                <div id="loginForm">
                    <div class="form-group">
                        <input type="email" id="loginEmail" class="form-control" placeholder="Email Address">
                    </div>
                    <div class="form-group">
                        <input type="password" id="loginPassword" class="form-control" placeholder="Password">
                    </div>
                    <button class="btn btn-primary btn-block" onclick="app.handleLogin()">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </div>
                
                <div id="registerForm" style="display: none;">
                    <div class="form-group">
                        <input type="text" id="registerName" class="form-control" placeholder="Full Name">
                    </div>
                    <div class="form-group">
                        <input type="email" id="registerEmail" class="form-control" placeholder="Email Address">
                    </div>
                    <div class="form-group">
                        <input type="tel" id="registerPhone" class="form-control" placeholder="Phone Number">
                    </div>
                    <div class="form-group">
                        <input type="password" id="registerPassword" class="form-control" placeholder="Password">
                    </div>
                    <div class="form-group">
                        <input type="text" id="registerAddress" class="form-control" placeholder="Address (Optional)">
                    </div>
                    <button class="btn btn-primary btn-block" onclick="app.handleRegister()">
                        <i class="fas fa-user-plus"></i> Register
                    </button>
                </div>
            </div>
        `;
    }

    showAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');
        
        document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }

        try {
            const response = await fetch(this.API_URL + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    user_type: this.selectedRole 
                })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('fabriconix_token', data.token);
                localStorage.setItem('fabriconix_user', JSON.stringify(data.user));
                this.currentUser = data.user;
                this.connectSocket();
                this.showDashboard();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Connection error. Make sure backend is running.', 'error');
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const address = document.getElementById('registerAddress').value;
        
        if (!name || !email || !phone || !password) {
            this.showNotification('Please fill required fields', 'error');
            return;
        }

        try {
            const response = await fetch(this.API_URL + '/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    phone, 
                    password, 
                    user_type: this.selectedRole,
                    address
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Registration successful! Please login.', 'success');
                this.showAuthTab('login');
            } else {
                this.showNotification(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Connection error. Make sure backend is running.', 'error');
        }
    }

    showDashboard() {
        const user = this.currentUser;
        const displayName = user?.name || 'User';
        const userType = user?.user_type || 'user';
        
        document.getElementById('app').innerHTML = `
            <div class="dashboard">
                <aside class="sidebar">
                    <div class="user-info">
                        <div class="profile-pic">
                            <i class="fas fa-user"></i>
                        </div>
                        <h3>${displayName}</h3>
                        <p>${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
                    </div>
                    
                    <ul class="sidebar-menu">
                        <li><a href="#" class="active" onclick="app.showSection('home')">
                            <i class="fas fa-home"></i> Dashboard
                        </a></li>
                        <li><a href="#" onclick="app.showSection('orders')">
                            <i class="fas fa-shopping-bag"></i> My Orders
                        </a></li>
                        <li><a href="#" onclick="app.showSection('profile')">
                            <i class="fas fa-user"></i> Profile
                        </a></li>
                        <li><a href="#" onclick="app.showSection('chat')">
                            <i class="fas fa-comments"></i> Chat
                        </a></li>
                        <li><a href="#" onclick="app.logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a></li>
                    </ul>
                </aside>
                
                <main class="main-content">
                    <div id="dashboardContent">
                        <div class="card">
                            <h2>Welcome back, ${displayName}!</h2>
                            <p style="color: #64748b; margin: 1rem 0;">What would you like to do today?</p>
                            
                            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                                <button class="btn btn-primary" onclick="app.showSection('new-order')">
                                    <i class="fas fa-plus"></i> New Order
                                </button>
                                <button class="btn btn-secondary" onclick="app.showSection('orders')">
                                    <i class="fas fa-history"></i> View Orders
                                </button>
                            </div>
                        </div>
                        
                        <div class="card" style="margin-top: 2rem;">
                            <h3>Recent Activity</h3>
                            <p style="color: #64748b; margin-top: 1rem;">No recent activity</p>
                        </div>
                    </div>
                </main>
            </div>
        `;
        
        this.loadUserOrders();
    }

    async loadUserOrders() {
        try {
            const token = localStorage.getItem('fabriconix_token');
            const response = await fetch(this.API_URL + '/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const orders = await response.json();
                console.log('Orders loaded:', orders);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    logout() {
        localStorage.removeItem('fabriconix_token');
        localStorage.removeItem('fabriconix_user');
        this.currentUser = null;
        if (this.socket) this.socket.disconnect();
        this.showLandingPage();
        this.showNotification('Logged out successfully', 'info');
    }
}

// Initialize the app
window.app = new FabriconixApp();

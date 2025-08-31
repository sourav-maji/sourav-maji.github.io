/**
 * PORTFOLIO JAVASCRIPT - SOURAV MAJI
 * Full Stack Developer & AI Enthusiast
 * ==================================================
 */

// Theme initialization & toggle
(function() {
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const metaTheme = document.getElementById('meta-theme-color');
    
    function applyTheme(theme) {
        if(theme === 'dark') { 
            root.setAttribute('data-theme','dark'); 
            metaTheme && (metaTheme.setAttribute('content','#0f172a')); 
        }
        else { 
            root.setAttribute('data-theme','light'); 
            metaTheme && (metaTheme.setAttribute('content','#ffffff')); 
        }
    }
    
    applyTheme(stored || (prefersDark ? 'dark' : 'light'));
    
    window.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('theme-toggle');
        if(!btn) return;
        
        function syncButton(){
            const isDark = root.getAttribute('data-theme') === 'dark';
            btn.setAttribute('aria-pressed', String(isDark));
            btn.querySelector('.toggle-text').textContent = isDark ? 'Light' : 'Dark';
            const icon = btn.querySelector('i');
            if(icon){ icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon'; }
        }
        
        syncButton();
        btn.addEventListener('click', () => {
            const current = root.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('theme', next);
            syncButton();
        });
    });
})();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Optimized navbar background change with RAF and throttling
let ticking = false;
let lastScrollY = 0;

function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    const currentScrollY = window.scrollY;
    
    if (Math.abs(currentScrollY - lastScrollY) > 2) { // Only update if significant change
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScrollY = currentScrollY;
    }
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
    }
});

// API functions for fetching live data
async function fetchGitHubStats() {
    try {
        const response = await fetch('https://api.github.com/users/sourav-maji');
        const data = await response.json();
        return {
            repos: data.public_repos,
            followers: data.followers,
            following: data.following
        };
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        return { repos: 'N/A', followers: 'N/A', following: 'N/A' };
    }
}

async function fetchLeetCodeStats() {
    try {
        // First try: Using alfa-leetcode-api
        const response = await fetch('https://alfa-leetcode-api.onrender.com/sourav-maji/solved');
        
        if (response.ok) {
            const data = await response.json();
            if (data.solvedProblem) {
                return { solved: data.solvedProblem };
            }
        }
        
        throw new Error('Primary API failed');
    } catch (error) {
        console.error('Error with primary LeetCode API:', error);
        
        try {
            // Second try: Using leetcode-stats-api
            const response2 = await fetch('https://leetcode-stats-api.herokuapp.com/sourav-maji');
            
            if (response2.ok) {
                const data = await response2.json();
                return { 
                    solved: data.totalSolved || (data.easySolved + data.mediumSolved + data.hardSolved),
                    easy: data.easySolved,
                    medium: data.mediumSolved,
                    hard: data.hardSolved
                };
            }
        } catch (error2) {
            console.error('Error with secondary LeetCode API:', error2);
        }
        
        // Fallback to alternative method
        return await fetchLeetCodeStatsAlternative();
    }
}

// Alternative LeetCode fetch using different service
async function fetchLeetCodeStatsAlternative() {
    try {
        // Using leetcode-query service
        const response = await fetch('https://leetcode-badge.haohaobear.me/api/v1/profile/sourav-maji');
        const data = await response.json();
        
        if (data && data.totalSolved) {
            return { solved: data.totalSolved };
        }
        
        // Final fallback with your actual current count
        return { solved: 453 };
    } catch (error) {
        console.error('Error fetching LeetCode stats alternative:', error);
        // Return your actual current solved count
        return { solved: 453 };
    }
}

// Enhanced counter animation with easing and smoother updates
function animateCounter(element, target) {
    if (target === 'N/A' || target === '...') {
        element.textContent = target;
        return;
    }
    
    const duration = 2000;
    let start = null;
    const startValue = 0;
    
    // Easing function for smoother animation
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.floor(startValue + (target - startValue) * easedProgress);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = target; // Ensure final value is exact
        }
    }
    
    requestAnimationFrame(animate);
}

// Enhanced load and display stats with better loading states
async function loadStats() {
    // Enhanced GitHub stats loading
    const githubElement = document.getElementById('github-repos');
    if (githubElement) {
        // Show skeleton/placeholder instead of dots
        githubElement.innerHTML = '<span class="loading-skeleton">--</span>';
        githubElement.classList.add('loading');
        
        try {
            const githubStats = await fetchGitHubStats();
            githubElement.classList.remove('loading');
            
            if (githubStats.repos !== 'N/A') {
                // Small delay for smooth transition from loading state
                setTimeout(() => animateCounter(githubElement, githubStats.repos), 150);
            } else {
                githubElement.innerHTML = '<span class="fallback-value">41</span>';
            }
        } catch (error) {
            githubElement.classList.remove('loading');
            githubElement.innerHTML = '<span class="fallback-value">41</span>';
        }
    }

    // Enhanced LeetCode stats loading
    const leetcodeElement = document.getElementById('leetcode-problems');
    if (leetcodeElement) {
        leetcodeElement.innerHTML = '<span class="loading-skeleton">--</span>';
        leetcodeElement.classList.add('loading');
        
        try {
            const leetcodeStats = await fetchLeetCodeStats();
            leetcodeElement.classList.remove('loading');
            
            if (leetcodeStats.solved !== 'N/A' && typeof leetcodeStats.solved === 'number') {
                setTimeout(() => animateCounter(leetcodeElement, leetcodeStats.solved), 150);
            } else {
                leetcodeElement.textContent = leetcodeStats.solved;
            }
        } catch (error) {
            leetcodeElement.classList.remove('loading');
            leetcodeElement.innerHTML = '<span class="fallback-value">453</span>';
        }
    }
}

// Stats observer for triggering animations when in view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.loaded) {
            entry.target.dataset.loaded = 'true';
            loadStats();
        }
    });
}, { threshold: 0.3 });

// Observe the stats section
const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Also load stats immediately if the stats section is already in view
document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
            loadStats();
        }
    }
});

// Optimized staggered animation with better performance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Use RAF for smoother animations
            requestAnimationFrame(() => {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 50); // Reduced delay for faster reveal
            });
            // Stop observing once animated to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Optimized project cards setup with lazy initialization
function initializeProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)'; // Reduced distance for subtlety
        card.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)`;
        observer.observe(card);
    });
}

// Optimized contact items setup
function initializeContactItems() {
    const items = document.querySelectorAll('.contact-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)`;
        observer.observe(item);
    });
}

// Optimized typing effect with better performance
function initializeTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;
    
    const text = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.minHeight = '1.2em'; // Prevent layout shift
    
    setTimeout(() => {
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
                // Variable speed for more natural typing
                const delay = text.charAt(i) === ' ' ? 50 : 80 + Math.random() * 40;
                setTimeout(typeWriter, delay);
            }
        };
        typeWriter();
    }, 800); // Reduced initial delay
}

// Optimized skill tags reveal with intersection observer
function initializeSkillTags() {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const tags = entry.target.querySelectorAll('.skill-tag');
                tags.forEach((tag, index) => {
                    tag.style.opacity = '0';
                    tag.style.transform = 'scale(0.9)';
                    tag.style.transition = `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)`;
                    
                    // Staggered reveal
                    setTimeout(() => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'scale(1)';
                    }, index * 30 + 200);
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const skillsContainer = document.querySelector('.skills');
    if (skillsContainer) {
        skillObserver.observe(skillsContainer);
    }
}

// Optimized parallax effect with RAF and throttling
let parallaxTicking = false;
let lastParallaxY = 0;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < window.innerHeight && Math.abs(scrolled - lastParallaxY) > 2) {
        // Reduced parallax intensity for smoother performance
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        lastParallaxY = scrolled;
    }
    parallaxTicking = false;
}

// Optimized parallax with reduced motion check
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            requestAnimationFrame(updateParallax);
            parallaxTicking = true;
        }
    });
}

// Optimized tech tag hover effects with event delegation
function initializeTechTagEffects() {
    const projectsContainer = document.querySelector('#projects');
    if (projectsContainer) {
        projectsContainer.addEventListener('mouseenter', function(e) {
            if (e.target.classList.contains('tech-tag')) {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
            }
        }, true);
        
        projectsContainer.addEventListener('mouseleave', function(e) {
            if (e.target.classList.contains('tech-tag')) {
                e.target.style.transform = 'translateY(0) scale(1)';
            }
        }, true);
    }
}

// Enhanced page load animation with better UX
function initializePageLoad() {
    // Set initial state
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    
    window.addEventListener('load', () => {
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
        });
    });
    
    // Fallback for slow networks
    setTimeout(() => {
        if (document.body.style.opacity === '0') {
            document.body.style.opacity = '1';
        }
    }, 3000);
}

// Initialize all optimized effects
document.addEventListener('DOMContentLoaded', () => {
    initializeProjectCards();
    initializeContactItems();
    initializeTypingEffect();
    initializeSkillTags();
    initializeTechTagEffects();
    initializePageLoad();
});

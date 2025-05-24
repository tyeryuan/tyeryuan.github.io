// 获取基础路径
function getBasePath() {
    const path = window.location.pathname;
    console.log('当前路径:', path);
    const depth = path.split('/').length - 2; // 减去文件名和开头的空字符串
    const basePath = '../'.repeat(Math.max(0, depth));
    console.log('计算的基础路径:', basePath);
    return basePath;
}

// 加载配置文件
async function loadConfig() {
    try {
        const basePath = getBasePath();
        const configPath = `${basePath}assets/config.json`;
        console.log('尝试加载配置文件:', configPath);
        const response = await fetch(configPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config = await response.json();
        console.log('成功加载配置:', config);
        return config;
    } catch (error) {
        console.error('加载配置文件失败:', error);
        return null;
    }
}

// 渲染分类卡片
function renderCategoryCard(category, parentPath = '') {
    const { id, title, description, subcategories } = category;
    const basePath = getBasePath();
    const path = parentPath ? `${parentPath}/${id}` : `categories/${id}`;
    const fullPath = `${basePath}${path}.html`;
    console.log('生成分类链接:', fullPath);
    
    return `
        <div class="category-card">
            <a href="${fullPath}" class="category-link">
                <h3>${title}</h3>
                <p>${description}</p>
                ${subcategories ? `<div class="category-meta">
                    <span class="subcategory-count">${subcategories.length} 个子分类</span>
                </div>` : ''}
            </a>
        </div>
    `;
}

// 渲染分类页面
async function renderCategoryPage(categoryId) {
    console.log('开始渲染分类页面:', categoryId);
    const config = await loadConfig();
    if (!config) {
        console.error('无法加载配置');
        return;
    }

    // 从tech分类中查找Unity分类
    const techCategory = config.categories.tech;
    if (!techCategory || !techCategory.subcategories) {
        console.error('未找到技术分类或子分类');
        return;
    }

    const category = techCategory.subcategories.find(sub => sub.id === categoryId);
    if (!category) {
        console.error('未找到分类:', categoryId);
        return;
    }

    // 更新页面标题和描述
    document.title = `${category.title} - 个人知识库`;
    document.querySelector('.category-header h1').textContent = category.title;
    document.querySelector('.category-header p').textContent = category.description;

    // 渲染子分类
    if (category.subcategories) {
        const categoryGrid = document.querySelector('.category-grid');
        categoryGrid.innerHTML = category.subcategories
            .map(sub => renderCategoryCard(sub, `categories/tech/${categoryId}`))
            .join('');
    }
}

// 渲染首页分类
async function renderHomeCategories() {
    console.log('开始渲染首页分类');
    const config = await loadConfig();
    if (!config) {
        console.error('无法加载配置');
        return;
    }

    const categoryGrid = document.querySelector('.category-grid');
    if (!categoryGrid) {
        console.error('未找到分类容器');
        return;
    }

    console.log('开始渲染分类卡片');
    categoryGrid.innerHTML = Object.entries(config.categories)
        .map(([id, category]) => renderCategoryCard({ id, ...category }))
        .join('');
    console.log('分类卡片渲染完成');
}

// 根据当前页面初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 加载完成，开始初始化');
    const path = window.location.pathname;
    console.log('当前页面路径:', path);
    
    if (path === '/' || path === '/index.html' || path.endsWith('/')) {
        console.log('检测到首页，开始渲染首页分类');
        renderHomeCategories();
    } else {
        // 从路径中提取分类ID
        const pathParts = path.split('/');
        const categoryId = pathParts[pathParts.length - 1].replace('.html', '');
        console.log('检测到分类页面，分类ID:', categoryId);
        renderCategoryPage(categoryId);
    }
}); 
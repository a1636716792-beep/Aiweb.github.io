// 工具展示页面的JavaScript代码
class ToolsGallery {
    constructor() {
        this.tools = [];
        this.filteredTools = [];
        this.categories = new Set();
        this.init();
    }

    async init() {
        try {
            // 加载工具数据
            await this.loadTools();
            
            // 初始化界面
            this.renderTools();
            this.setupEventListeners();
            this.populateCategories();
            
            // 隐藏加载状态
            document.querySelector('.loading').style.display = 'none';
        } catch (error) {
            console.error('初始化失败:', error);
            document.querySelector('.loading').textContent = '加载失败，请刷新页面重试';
        }
    }

    async loadTools() {
        try {
            const response = await fetch('tools.csv');
            const csvText = await response.text();
            this.parseCSV(csvText);
        } catch (error) {
            console.error('加载CSV失败:', error);
            // 使用默认数据作为后备
            this.tools = this.getDefaultTools();
            this.filteredTools = [...this.tools];
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        this.tools = [];
        this.categories = new Set();

        // 解析标题行
        const headers = this.parseCSVLine(lines[0]);

        // 解析数据行
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const fields = this.parseCSVLine(line);
            if (fields.length < headers.length) continue;

            // 根据列数判断格式
            let tool = {};
            if (headers.length === 6) {
                // 新格式：工具类别,工具名称,简介,官网链接,Logo链接,Logo本地路径
                tool = {
                    category: fields[0] || '',
                    name: fields[1] || '',
                    description: fields[2] || '',
                    officialUrl: fields[3] || '',
                    iconUrl: fields[4] || '',
                    localIcon: fields[5] || ''
                };
            } else {
                // 兼容旧格式
                tool = {
                    category: fields[0] || '',
                    name: fields[1] || '',
                    description: fields[2] || '',
                    officialUrl: fields[4] || '',
                    iconUrl: fields[5] || '',
                    localIcon: fields[6] || ''
                };
            }

            // 确保必要字段存在
            if (tool.name && tool.name.trim()) {
                this.tools.push(tool);
                if (tool.category) {
                    this.categories.add(tool.category);
                }
            }
        }

        this.filteredTools = [...this.tools];
        console.log(`成功加载 ${this.tools.length} 个工具`);
    }

    parseCSVLine(line) {
        const fields = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        fields.push(current.trim());
        return fields;
    }

    getDefaultTools() {
        return [
            {
                category: 'AI创新工具',
                name: 'ChatGPT',
                description: 'OpenAI的对话AI，能够进行自然语言对话，回答问题，协助创作等。',
                officialUrl: 'https://chat.openai.com',
                iconUrl: 'https://ai-bot.cn/wp-content/uploads/2025/07/Chatgpt-logo.png'
            },
            {
                category: 'AI绘画工具',
                name: 'Midjourney',
                description: 'AI图像生成工具，可以根据文字描述生成高质量的艺术图像。',
                officialUrl: 'https://www.midjourney.com/home',
                iconUrl: 'https://ai-bot.cn/wp-content/uploads/2023/03/midjourney-icon.png'
            },
            {
                category: 'AI视频工具',
                name: 'Runway',
                description: 'AI视频工具，提供绿幕抠除、视频生成、动态捕捉等功能。',
                officialUrl: 'https://runwayml.com/?utm_source=ai-bot.cn',
                iconUrl: 'https://ai-bot.cn/wp-content/uploads/2023/03/runwayml-icon.png'
            }
        ];
    }

    renderTools() {
        const container = document.getElementById('toolsContainer');
        
        if (this.filteredTools.length === 0) {
            container.innerHTML = '<div class="no-results">未找到匹配的工具</div>';
            return;
        }

        container.innerHTML = this.filteredTools.map(tool => this.createToolCard(tool)).join('');
        
        // 为每个卡片添加事件监听器
        this.attachCardEvents();
    }

    createToolCard(tool) {
        // 如果没有图标URL，使用默认图标
        const iconUrl = tool.iconUrl && tool.iconUrl.trim() ? tool.iconUrl : this.getDefaultIcon(tool.category);
        
        return `
            <div class="tool-card" data-url="${tool.officialUrl}">
                <div class="card-header">
                    <div class="tool-icon">
                        <img src="${iconUrl}" alt="${tool.name}" onerror="this.parentElement.innerHTML='<div class=\'fallback-icon\'>🛠️</div>'">
                    </div>
                    <div class="tool-info">
                        <div class="tool-name">${tool.name}</div>
                        <div class="tool-category">${tool.category || '未分类'}</div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="tool-description description-short">
                        ${tool.description || '暂无描述'}
                    </div>
                    <button class="expand-btn">展开详情</button>
                </div>
                <div class="card-footer">
                    <button class="visit-btn">访问官网</button>
                </div>
            </div>
        `;
    }

    getDefaultIcon(category) {
        const iconMap = {
            'AI创新工具': '🔧',
            'AI绘画工具': '🎨',
            'AI视频工具': '🎬',
            'AI音频工具': '🎵',
            'AI学习资源': '📚',
            'AI办公工具': '📊',
            'AI搜索引擎': '🔍',
            'AI编程工具': '💻',
            'AI写作工具': '✍️',
            'AI营销工具': '📈'
        };
        
        return iconMap[category] || '🛠️';
    }

    attachCardEvents() {
        // 展开/收起按钮事件
        document.querySelectorAll('.expand-btn').forEach(button => {
            button.addEventListener('click', function() {
                const description = this.previousElementSibling;
                const isExpanded = description.classList.contains('description-full');
                
                if (isExpanded) {
                    description.classList.remove('description-full');
                    description.classList.add('description-short');
                    this.textContent = '展开详情';
                } else {
                    description.classList.remove('description-short');
                    description.classList.add('description-full');
                    this.textContent = '收起详情';
                }
            });
        });

        // 访问官网按钮事件
        document.querySelectorAll('.visit-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.tool-card');
                const url = card.getAttribute('data-url');
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });

        // 卡片点击事件（除了按钮）
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // 如果点击的是按钮，则不触发卡片点击事件
                if (e.target.classList.contains('visit-btn') || 
                    e.target.classList.contains('expand-btn')) {
                    return;
                }
                
                const url = this.getAttribute('data-url');
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });
    }

    setupEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            this.filterTools(searchTerm);
        };
        
        searchInput.addEventListener('input', performSearch);
        searchBtn.addEventListener('click', performSearch);
        
        // 分类筛选
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.addEventListener('change', () => {
            const selectedCategory = categoryFilter.value;
            this.filterByCategory(selectedCategory);
        });
        
        // 重置筛选
        const resetFilters = document.getElementById('resetFilters');
        resetFilters.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = '';
            this.filteredTools = [...this.tools];
            this.renderTools();
        });
    }

    populateCategories() {
        const categoryFilter = document.getElementById('categoryFilter');
        
        // 添加分类选项
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    filterTools(searchTerm) {
        if (!searchTerm) {
            this.filteredTools = [...this.tools];
        } else {
            this.filteredTools = this.tools.filter(tool => 
                tool.name.toLowerCase().includes(searchTerm) ||
                tool.description.toLowerCase().includes(searchTerm) ||
                (tool.category && tool.category.toLowerCase().includes(searchTerm))
            );
        }
        
        // 应用分类筛选
        const selectedCategory = document.getElementById('categoryFilter').value;
        if (selectedCategory) {
            this.filteredTools = this.filteredTools.filter(tool => 
                tool.category === selectedCategory
            );
        }
        
        this.renderTools();
    }

    filterByCategory(category) {
        if (!category) {
            this.filteredTools = [...this.tools];
        } else {
            this.filteredTools = this.tools.filter(tool => 
                tool.category === category
            );
        }
        
        // 应用搜索筛选
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        if (searchTerm) {
            this.filteredTools = this.filteredTools.filter(tool => 
                tool.name.toLowerCase().includes(searchTerm) ||
                tool.description.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderTools();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.toolsGallery = new ToolsGallery();
});
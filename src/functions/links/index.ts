export function replaceLinksInElement(container: HTMLElement | null) {
  if (!container) {
    console.warn("replaceLinksInElement: container is null or undefined");
    return;
  }

  // 转义HTML函数，防止XSS攻击
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // 获取容器内所有a标签
  const links = container.querySelectorAll("a");
  if (!links || links.length === 0) {
    return;
  }

  const is_new_link_style = localStorage.getItem("enable_hyperlink") === "true" ? true : false;

  links.forEach((link) => {
    try {
      const href = link.href;
      const target = link.getAttribute("target") || "";
      const text = link.textContent?.trim() || "";
      const className = link.getAttribute("class") || "";
      if (className.includes("dont-replace")) return;
      // 跳过空链接或无效链接
      if (!href || href === "#" || href === "javascript:void(0)") {
        return;
      }
      if (!is_new_link_style) {
        // 从URL提取域名用于favicon
        linkStyleRender(href, target, text, link);
      } else {
        linkStyleRenderByPluginHyperlinkCard(href, target, text, link);
      }
    } catch (error) {
      // 出错时保留原始链接
    }
  });

  /**
   * 超链接渲染 - 原主题默认
   *
   * @param href 超链接
   * @param target 打开方式
   * @param text 超链接文字
   * @param link a标签dom对象
   */
  function linkStyleRender(href: string, target: string, text: string, link: HTMLAnchorElement) {
    const domain = new URL(href).hostname;

    // 创建新链接的HTML结构
    const newLinkHTML = `
        <a class="inline-flex place-items-baseline items-baseline gap-0.5 px-0.5 text-[0.95em] leading-none font-semibold  hover:underline "
        rel="noopener noreferrer" 
        target="${target}" 
        href="${escapeHtml(href)}">
        <span class="inline-flex translate-y-0.5">
            <img alt="" aria-hidden="true" loading="lazy" width="16" height="16"
                decoding="async" data-nimg="1" class="inline h-4 w-4 rounded"
                src="https://cali.so/api/favicon?url=${escapeHtml(domain)}"
                style="color: transparent">
        </span>
        ${escapeHtml(text)}
        <svg width="0.95em" height="0.95em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block translate-y-0.5" aria-hidden="true"><path d="M20 13.5001C20 14.8946 20 15.5919 19.8618 16.1673C19.4229 17.9956 17.9955 19.423 16.1672 19.8619C15.5918 20.0001 14.8945 20.0001 13.5 20.0001H12C9.19974 20.0001 7.79961 20.0001 6.73005 19.4551C5.78924 18.9758 5.02433 18.2109 4.54497 17.2701C4 16.2005 4 14.8004 4 12.0001V11.5001C4 9.17035 4 8.0055 4.3806 7.08664C4.88807 5.8615 5.86144 4.88813 7.08658 4.38066C7.86344 4.05888 8.81614 4.00915 10.5 4.00146M19.7597 9.45455C20.0221 7.8217 20.0697 6.16984 19.9019 4.54138C19.8898 4.42328 19.838 4.31854 19.7597 4.24027M19.7597 4.24027C19.6815 4.16201 19.5767 4.11023 19.4586 4.09806C17.8302 3.93025 16.1783 3.97792 14.5455 4.24027M19.7597 4.24027L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </a>`;

    // 创建临时容器并插入新元素
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = newLinkHTML;
    const newLink = tempDiv.firstElementChild;

    if (newLink && link.parentNode) {
      // 替换原始链接
      link.parentNode.replaceChild(newLink, link);
    }
  }

  /**
   * 超链接渲染 - plugin-editor-hyperlink-card 插件渲染
   *
   * 插件只能在官方富文本编辑器中使用
   * 用该方法渲染到所有a标签，支持markdown
   *
   * <a href="https://github.com/halo-sigs/plugin-editor-hyperlink-card"></a>
   * @param href 超链接
   * @param target 打开方式
   * @param text 超链接文字
   * @param link a标签dom对象
   */
  function linkStyleRenderByPluginHyperlinkCard(href: string, target: string, text: string, link: HTMLAnchorElement) {
    // 创建新链接的HTML结构
    let newLinkHTML = "";
    // 默认新窗口打开
    target = target.length == 0 ? "_blank" : target;

    if (text.includes("#regular")) {
      newLinkHTML = `<hyperlink-card href="${escapeHtml(href)}" target="${target}" theme="regular"></hyperlink-card>`;
    } else if (text.includes("#small")) {
      newLinkHTML = `<hyperlink-card href="${escapeHtml(href)}" target="${target}" theme="small"></hyperlink-card>`;
    } else if (text.includes("#grid")) {
      newLinkHTML = `<hyperlink-card href="${escapeHtml(href)}" target="${target}" theme="grid"></hyperlink-card>`;
    } else {
      newLinkHTML = `<hyperlink-inline-card href="${escapeHtml(href)}" target="${target}"></hyperlink-inline-card>`;
    }

    // 创建临时容器并插入新元素
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = newLinkHTML;
    const newLink = tempDiv.firstElementChild;

    if (newLink && link.parentNode) {
      // 替换原始链接
      link.parentNode.replaceChild(newLink, link);
    }
  }
}

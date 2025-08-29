async function loadPapers(paths) {
    const results = await Promise.all(paths.map(async (p) => {
        const text = await (await fetch(p)).text();
        return {
            path: p,
            data: jsyaml.load(text)
        };
    }));

    // Keep original order (paths array), or sort by year/title/etc. here.
    for (const {
            data
        }
        of results) {
        renderPaper(data); // factor out the DOM-append part from showPaper
    }
}

function renderPaper(data) {
    const venueParts = data.venue.split(/\s+/);
    const venue = venueParts[0];
    const year = venueParts.slice(1).join(' ');

    const highlightNames = new Set([
        "Hengyuan Hu",
        "Meta Fundamental AI Research Diplomacy Team (FAIR)",
    ]);

    const authors = data.authors
        .map((a) => {
            const cleanName = a.replace(/\*$/, "").trim(); // strip trailing * used in YAML
            return highlightNames.has(cleanName)
            ? `<span class="highlight-author">${a}</span>`
            : a;
        })
        .join(", ");

    const iconMap = {
        "Website": '<i class="fa fa-globe" aria-hidden="true"></i>',
        "Code": '<i class="fa fa-code" aria-hidden="true"></i>'
    };

    const linksHTML = Object.entries(data.links || {})
        .map(([name, url]) => {
            const icon = iconMap[name] || name; // fallback to text if unknown
            return `<a href="${url}" target="_blank" title="${name}">${icon}</a>`;
        })
        .join(' ');

    const tagsHTML = (data.tags || [])
        .map(tag => `<span class="label label-tag">${tag}</span>`)
        .join(' ');


    const html = `
  <div class="paper-item">
    <div class="paper-title">
      <a href="${data.paper.link}" target="_blank">${data.paper.title}</a>
    </div>
    <div class="paper-meta">
      <span class="label label-venue">${venue}</span>
      <span class="label label-year">${year}</span>
      &nbsp;·&nbsp; ${authors}
    </div>
    <div class="paper-links-tags">
        <div class="paper-tags">
            ${tagsHTML}
        </div>
        <div class="paper-links">
            ${linksHTML}
        </div>
    </div>
  </div>`;
    document.getElementById('papers-list').insertAdjacentHTML('beforeend', html);
}

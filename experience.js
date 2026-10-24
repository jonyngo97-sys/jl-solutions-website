(() => {
  // All panels and their real links remain available if JavaScript is disabled.
  document.querySelectorAll('[data-tabset]').forEach(root => {
    const list = root.querySelector(':scope > [role="tablist"]');
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    if (!tabs.length || panels.some(panel => !panel)) return;
    // Match the keyboard semantics to the stacked phone controls.
    if (typeof window !== 'undefined' && window.matchMedia) {
      const query = window.matchMedia(list.classList.contains('goal-tabs') ? '(max-width:620px)' : '(max-width:420px)');
      const orient = () => list.setAttribute('aria-orientation', query.matches ? 'vertical' : 'horizontal');
      orient(); query.addEventListener('change', orient);
    }
    function select(index, focus = false) {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        const next = { ArrowRight:(index+1)%tabs.length, ArrowDown:(index+1)%tabs.length, ArrowLeft:(index-1+tabs.length)%tabs.length, ArrowUp:(index-1+tabs.length)%tabs.length, Home:0, End:tabs.length-1 }[event.key];
        if (next === undefined) return;
        event.preventDefault(); select(next, true);
      });
    });
    select(0); root.dataset.ready = 'true';
  });
  const materialImage = document.querySelector('[data-material-image]');
  const materialLabel = document.querySelector('[data-material-label]');
  const choices = [...document.querySelectorAll('[data-material]')];
  choices.forEach(button => button.addEventListener('click', () => {
    const material = button.dataset.material;
    if (!['wood','slate','metal'].includes(material) || !materialImage) return;
    materialImage.src = '/assets/material-' + material + '.webp';
    materialImage.alt = button.textContent.trim();
    materialLabel.textContent = button.textContent.trim();
    choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
  }));
})();

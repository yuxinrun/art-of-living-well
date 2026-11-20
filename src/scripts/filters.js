/* 列表筛选：栏目标签、书籍分类 */

export function initFilters() {
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const container = group.closest('.category-main');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('[data-tags]'));
    const empty = container.querySelector('[data-filter-empty]');
    const chips = Array.from(group.querySelectorAll('[data-filter-tag]'));

    group.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-filter-tag]');
      if (!chip) return;
      const value = chip.getAttribute('data-filter-tag');
      chips.forEach((c) => c.classList.toggle('is-active', c === chip));
      let visible = 0;
      cards.forEach((card) => {
        const tags = (card.getAttribute('data-tags') || '').split('|');
        const show = value === 'all' || tags.includes(value);
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });

  const bookGroup = document.querySelector('[data-book-filter-group]');
  const bookGrid = document.querySelector('[data-book-grid]');
  if (bookGroup && bookGrid) {
    const books = Array.from(bookGrid.querySelectorAll('[data-book-cat]'));
    const chips = Array.from(bookGroup.querySelectorAll('[data-book-filter]'));
    bookGroup.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-book-filter]');
      if (!chip) return;
      const value = chip.getAttribute('data-book-filter');
      chips.forEach((c) => c.classList.toggle('is-active', c === chip));
      books.forEach((book) => {
        book.hidden = value !== 'all' && book.getAttribute('data-book-cat') !== value;
      });
    });
  }
}
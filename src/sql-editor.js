import { EditorState, StateField } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentMore, indentLess, insertNewlineKeepIndent } from '@codemirror/commands';
import { indentUnit, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { SQLite } from '@codemirror/lang-sql';
import { tags } from '@lezer/highlight';

const colors = HighlightStyle.define([
  { tag: tags.keyword, class: 'sql-keyword' },
  { tag: tags.string, class: 'sql-string' },
  { tag: tags.number, class: 'sql-number' },
  { tag: tags.comment, class: 'sql-comment' },
  { tag: tags.operator, class: 'sql-operator' },
]);

export function initialSlots(lesson, doc, stored) {
  if (Array.isArray(stored) && stored.length === lesson.slots?.length && stored.every(slot => Number.isInteger(slot.from) && Number.isInteger(slot.to) && slot.from >= 0 && slot.to >= slot.from && slot.to <= doc.length)) return stored;
  if (doc !== lesson.starter) return [];
  return (lesson.slots || []).map(slot => {
    const from = doc.indexOf(slot.after) + slot.after.length;
    return { from, to: from, label: slot.label };
  });
}

export function createSqlEditor({ parent, doc, slots = [], onChange, onCast }) {
  // Map slot boundaries through edits, including undo, paste, and indentation.
  const slotField = StateField.define({
    create: () => slots,
    update: (ranges, transaction) => ranges.map(slot => ({ ...slot,
      from: transaction.changes.mapPos(slot.from, -1),
      to: transaction.changes.mapPos(slot.to, 1),
    })),
  });
  const view = new EditorView({ parent, state: EditorState.create({ doc,
    selection: { anchor: slots[0]?.from ?? 0, head: slots[0]?.to ?? 0 },
    extensions: [
      slotField, SQLite.language, syntaxHighlighting(colors), history(), lineNumbers(), drawSelection(), highlightActiveLine(),
      indentUnit.of('  '), EditorState.tabSize.of(2), EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': 'SQL query', 'aria-describedby': 'keyboard-tip slot-guide', spellcheck: 'false', autocapitalize: 'off' }),
      EditorView.domEventHandlers({ blur: (_event, editor) => { editor.setTabFocusMode(false); } }),
      keymap.of([
        { key: 'Escape', run: editor => { editor.setTabFocusMode(true); return true; } },
        { key: 'Mod-Enter', run: () => { onCast(); return true; } },
        { key: 'Ctrl-Enter', run: () => { onCast(); return true; } },
        { key: 'Tab', run: editor => {
          if (editor.state.selection.ranges.some(range => !range.empty)) return indentMore(editor);
          editor.dispatch(editor.state.replaceSelection('  '), { scrollIntoView: true, userEvent: 'input' });
          return true;
        }, shift: indentLess },
        { key: 'Enter', run: insertNewlineKeepIndent },
        ...defaultKeymap, ...historyKeymap,
      ]),
      EditorView.updateListener.of(update => {
        if (update.docChanged) onChange(update.state.doc.toString(), update.state.field(slotField));
      }),
    ],
  }) });
  let slotIndex = 0;
  return {
    get value() { return view.state.doc.toString(); },
    focus() { view.focus(); },
    nextSlot() {
      const ranges = view.state.field(slotField);
      if (!ranges.length) return;
      slotIndex = (slotIndex + 1) % ranges.length;
      const slot = ranges[slotIndex];
      view.dispatch({ selection: { anchor: slot.from, head: slot.to }, scrollIntoView: true });
      view.focus();
    },
    missingSlot() { return view.state.field(slotField).find(slot => !view.state.sliceDoc(slot.from, slot.to).trim()); },
    destroy() { view.destroy(); },
  };
}

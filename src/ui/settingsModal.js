/* ============================================================================
 * settingsModal.js — 設定彈窗：音效/環境音/減少動態/數字格式開關、存檔匯出匯入、
 * 重看教學、重置存檔。由頂欄齒輪按鈕開啟。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const Save = window.App.Systems.Save;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;
  const Toast = window.App.UI.Toast;
  const Modals = window.App.UI.Modals;

  function toggleRow(label, checked, onToggle) {
    const row = U.el('div', 'settingsRow');
    row.appendChild(U.el('span', 'settingsLabel', label));
    const btn = U.el('button', 'toggleBtn' + (checked ? ' toggleOn' : ''), checked ? '開' : '關');
    U.onTap(btn, () => {
      const next = !btn.classList.contains('toggleOn');
      btn.classList.toggle('toggleOn', next);
      btn.textContent = next ? '開' : '關';
      onToggle(next);
    });
    row.appendChild(btn);
    return row;
  }

  function sliderRow(label, value, onInput) {
    const row = U.el('div', 'settingsRow settingsSliderRow');
    row.appendChild(U.el('span', 'settingsLabel', label));
    const wrap = U.el('div', 'settingsSliderWrap');
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.value = String(value);
    input.className = 'settingsSlider';
    const valueLabel = U.el('span', 'settingsSliderValue', value + '%');
    input.addEventListener('input', () => {
      valueLabel.textContent = input.value + '%';
      onInput(parseInt(input.value, 10));
    });
    wrap.appendChild(input);
    wrap.appendChild(valueLabel);
    row.appendChild(wrap);
    return row;
  }

  function applyHighContrast(save) {
    document.body.classList.toggle('highContrast', !!save.settings.highContrast);
  }

  function open(save, onChange) {
    const overlay = document.getElementById('modalOverlay');
    U.clearNode(overlay);
    const box = U.el('div', 'modalBox settingsBox');
    function close() { overlay.style.display = 'none'; U.clearNode(overlay); }

    box.appendChild(U.el('div', 'modalTitle', '設定'));

    box.appendChild(toggleRow('音效', save.settings.sound, (v) => {
      save.settings.sound = v; Audio.syncSettings(save); onChange();
    }));
    box.appendChild(sliderRow('音效音量', save.settings.sfxVolume, (v) => {
      save.settings.sfxVolume = v; Audio.syncSettings(save);
    }));
    const testSoundBtn = U.el('button', 'smallBtn settingsFullBtn', '測試音效');
    U.onTap(testSoundBtn, () => { Audio.unlock(save); Audio.play('collect'); });
    box.appendChild(testSoundBtn);

    box.appendChild(toggleRow('環境音', save.settings.ambient, (v) => {
      save.settings.ambient = v; Audio.syncSettings(save); onChange();
    }));
    box.appendChild(sliderRow('環境音音量', save.settings.ambientVolume, (v) => {
      save.settings.ambientVolume = v; Audio.syncSettings(save);
    }));
    box.appendChild(toggleRow('減少動態效果', save.settings.reducedMotion, (v) => {
      save.settings.reducedMotion = v; FX.syncSettings(save); onChange();
    }));
    box.appendChild(toggleRow('高對比模式', save.settings.highContrast, (v) => {
      save.settings.highContrast = v; applyHighContrast(save); onChange();
    }));
    box.appendChild(toggleRow('數字格式：科學記號', save.settings.numberFormat === 'sci', (v) => {
      save.settings.numberFormat = v ? 'sci' : 'zh'; U.setNumberFormat(save.settings.numberFormat); onChange();
    }));

    const sep1 = U.el('div', 'settingsSep');
    box.appendChild(sep1);

    const replayBtn = U.el('button', 'smallBtn settingsFullBtn', '重看新手教學');
    U.onTap(replayBtn, () => {
      save.tutorial.done = false;
      close();
      onChange();
      Toast.toast('下次進入潛航畫面會重新顯示教學');
    });
    box.appendChild(replayBtn);

    const compendiumBtn = U.el('button', 'smallBtn settingsFullBtn', '遊戲說明');
    U.onTap(compendiumBtn, () => window.App.UI.CompendiumModal.open());
    box.appendChild(compendiumBtn);

    const exportBtn = U.el('button', 'smallBtn settingsFullBtn', '匯出存檔');
    U.onTap(exportBtn, () => {
      const text = Save.exportString(save);
      const ta = document.createElement('textarea');
      ta.className = 'settingsTextarea';
      ta.readOnly = true;
      ta.value = text;
      box.insertBefore(ta, exportBtn.nextSibling);
      ta.focus(); ta.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => Toast.toast('已複製存檔到剪貼簿')).catch(() => Toast.toast('請手動複製上方文字'));
      } else {
        Toast.toast('請手動複製上方文字');
      }
    });
    box.appendChild(exportBtn);

    const importBtn = U.el('button', 'smallBtn settingsFullBtn', '匯入存檔');
    U.onTap(importBtn, () => {
      const ta = document.createElement('textarea');
      ta.className = 'settingsTextarea';
      ta.placeholder = '貼上匯出的存檔文字';
      const confirmBtn = U.el('button', 'smallBtn settingsFullBtn', '確認匯入');
      U.onTap(confirmBtn, () => {
        const parsed = Save.importString(ta.value);
        if (!parsed) { Toast.toast('存檔格式錯誤'); return; }
        Modals.showConfirm('匯入將覆蓋目前的存檔進度，確定嗎？', () => {
          Save.save(parsed);
          location.reload();
        }, { title: '匯入存檔', danger: true, onCancel: () => open(save, onChange) });
      });
      box.insertBefore(confirmBtn, importBtn.nextSibling);
      box.insertBefore(ta, confirmBtn);
      ta.focus();
    });
    box.appendChild(importBtn);

    const sep2 = U.el('div', 'settingsSep');
    box.appendChild(sep2);

    const resetBtn = U.el('button', 'smallBtn dangerBtn settingsFullBtn', '重置存檔');
    U.onTap(resetBtn, () => {
      Modals.showConfirm('確定要重置存檔嗎？此動作無法復原。', () => {
        Save.reset();
        location.reload();
      }, { title: '重置存檔', danger: true, confirmLabel: '重置', onCancel: () => open(save, onChange) });
    });
    box.appendChild(resetBtn);
    box.appendChild(U.el('div', 'subHint', '《潛燈》DEEPLIGHT v1.3'));

    const closeBtn = U.el('button', 'modalBtn', '關閉');
    U.onTap(closeBtn, close);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    overlay.style.display = 'flex';
  }

  window.App.UI.SettingsModal = { open };
})();

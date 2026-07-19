/* ============================================================================
 * milestoneSystem.js — 里程碑達成判定與領取。判定用 maxDepthEver（史上最大深度），
 * 永久保留，一般轉生／深淵協約都不會讓已達成的里程碑重新變回未達成。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const Econ = window.App.Systems.Economy;

  function isReached(save, def) { return save.maxDepthEver >= def.depth; }
  function isClaimed(save, id) { return save.milestonesClaimed.includes(id); }

  function claim(save, id) {
    const def = D.milestoneById(id);
    if (!def) return { ok: false, reason: '找不到此里程碑' };
    if (isClaimed(save, id)) return { ok: false, reason: '已領取過此里程碑' };
    if (!isReached(save, def)) return { ok: false, reason: '尚未抵達此深度' };
    const gained = Econ.glowPerSec(save) * def.rewardSeconds;
    save.glow += gained;
    save.stats.totalGlowEarned += gained;
    save.milestonesClaimed.push(id);
    return { ok: true, gained, def };
  }

  function unclaimedReachedCount(save) {
    return D.MILESTONE_DEFS.filter((def) => isReached(save, def) && !isClaimed(save, def.id)).length;
  }

  window.App.Systems.Milestone = { isReached, isClaimed, claim, unclaimedReachedCount };
})();

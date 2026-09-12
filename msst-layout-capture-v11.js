/* v11: capture the untouched Mississippi State / base renderers BEFORE any Week 3 override scripts run. */
(() => {
  const names=[
    'dashboardPage','playersPage','playerCard','personnelPage','runPage','passPage','heatmapPage','coveragePage','situationsPage','rushCountPage','pressurePage',
    'renderFAUDrawer','renderPortalTab','overviewFAU','passingPanel','rushingPanel','routeTreePanel','targetsPanel','coveragePlayerPanel','topGamesPanel','gameLogFAU','coachNotesFAU'
  ];
  window.__MSST_LAYOUT__=window.__MSST_LAYOUT__||{};
  names.forEach(n=>{ if(typeof window[n]==='function') window.__MSST_LAYOUT__[n]=window[n]; });
})();

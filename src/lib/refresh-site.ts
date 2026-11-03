/** After a console save that changes public content, drop the public page cache so the change shows at once. */
export function refreshSite() {
  void fetch("/api/admin/revalidate", { method: "POST", keepalive: true }).catch(() => {});
}

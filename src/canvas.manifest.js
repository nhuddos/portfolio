export const manifest = {
  screens: {
    scr_guu1qd: { name: "Home", route: "/", position: { "x": 0, "y": 0 }, width: 1000, height: 720, isDefaultRow: true },
    scr_90xxcc: { name: "Works", route: "/works", position: { "x": 160, "y": 1820 } },
    scr_srkm80: { name: "Work Detail", route: "/works/arcade-banking", position: { "x": 1560, "y": 1820 } },
    scr_xeqyah: { name: "Artworks", route: "/artworks", position: { "x": 1400, "y": 0 }, isDefaultRow: true },
    scr_rsvmf9: { name: "About", route: "/about", position: { "x": 2800, "y": 0 }, isDefaultRow: true }
  },
  sections: {
    sec_msczey: { name: "Works Portfolio", x: 0, y: 1600, width: 2920, height: 1180 }
  },
  layers: [
    { kind: "screen", id: "scr_guu1qd" },
    { kind: "screen", id: "scr_xeqyah" },
    { kind: "screen", id: "scr_rsvmf9" },
    {
      kind: "section", id: "sec_msczey", children: [
        { kind: "screen", id: "scr_90xxcc" },
        { kind: "screen", id: "scr_srkm80" }]
    }]
};
"use client";

import { useEffect } from "react";
import Script from "next/script";
import styles from "./academyEditor.module.scss";
import Link from "next/link";
import { Blocks } from "lucide-react";
import ModeSwitch from "@/src/app/(root)/_components/modeSwitch";

export default function AcademyPage() {
 useEffect(() => {
  let destroyFn: (() => void) | undefined;

  import("./academyEditor").then((m) => {
    m.initAcademyEditor();
    destroyFn = m.destroyAcademyEditor;
  });

  return () => {
    destroyFn?.();
  };
}, []);




  return (
    <div className={styles.wrapper}>
      {/* ===== ACE SCRIPT (with fallback, blocking) ===== */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.43.2/ace.js"
        strategy="afterInteractive"
        integrity="sha512-ZIa+FlPaGDSM+lTl9JaxnQvcfma7ETsOHd9Thbhp5u4RX1uYiDNW7XvUrXv4dJSPetXbiTzWilHEkSg4YpmltQ=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => {
          const s = document.createElement("script");
          s.src =
            "https://cdn.jsdelivr.net/npm/ace-builds@1.43.2/src-min/ace.js";
          document.head.appendChild(s);
        }}
      />

      <header>
        
        <div className="container row">
          {/* Codify Logo */}
          <Link href="/web" className="flex items-center gap-3 group relative">
            <div
              className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
        rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"
            />

            <div
              className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl 
        ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
            >
              <Blocks className="size-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
                Codify
              </span>
              <span className="text-xs text-blue-400/60 font-medium">
                Interactive Code Editor
              </span>
            </div>
          </Link>
          <ModeSwitch />
          {/* Right buttons */}
          <div className="row">
            <button className="btn secondary" id="saveBtn">
              Save
            </button>
            <button className="btn secondary" id="loadBtn">
              Load
            </button>
            <input id="openFile" type="file" hidden />
          </div>
        </div>
      </header>

      <main>
        <aside className="card panel stack">
          <h2>Task / Assignment</h2>
          <textarea id="assignment" className="text" />
          <label>Validation tests</label>
          <textarea id="testArea" className="text" />
        </aside>

        <section className="stack">
          <div className="stack card panel" id="webEditors">
            <div className="row">
              <h2>HTML / CSS / JS</h2>
              <div className="row">
                <button className="btn ok" id="runWeb">
                  Run
                </button>
                <button className="btn secondary" id="openPreview">
                  Open preview
                </button>
              </div>
            </div>

            <div className="tabs" id="webTabs">
              <button className="tab active" data-pane="html">
                HTML
              </button>
              <button className="tab" data-pane="css">
                CSS
              </button>
              <button className="tab" data-pane="js">
                JavaScript
              </button>
            </div>

            <div className="editor-wrap" data-pane="html">
              <div id="ed_html" className="editor" />
            </div>
            <div className="editor-wrap" data-pane="css" hidden>
              <div id="ed_css" className="editor" />
            </div>
            <div className="editor-wrap" data-pane="js" hidden>
              <div id="ed_js" className="editor" />
            </div>

            <h3>Preview</h3>
            <iframe
              id="preview"
              className="preview"
              sandbox="allow-scripts allow-same-origin allow-modals"
            />
          </div>
        </section>

        <aside className="card panel stack">
          <h2>Output</h2>
          <div id="output" className="out" />
          <div className="row">
            <button className="btn warn" id="runTests">
              Run with tests
            </button>
            <button className="btn secondary" id="clearOut">
              Clear log
            </button>
          </div>
        </aside>
      </main>

      <div className="footer">© 2025 Codify</div>
      
    </div>
  );
}

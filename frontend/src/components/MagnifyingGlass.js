import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";

export default function MagnifyingGlass() {
    const [isActive, setIsActive] = useState(false);
    const [position, setPosition] = useState({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    });
    const magnifiedContentRef = useRef(null);
    const clonedContentRef = useRef(null);
    const frameRef = useRef(null);
    const rafRef = useRef();

    const magnifierSize = 220;
    const zoomLevel = 2.5;

    useEffect(() => {
        let ticking = false;

        const updatePosition = (x, y) => {
            // Direct DOM manipulation for smooth transforms (no re-render)
            if (clonedContentRef.current) {
                clonedContentRef.current.style.transform = `translate3d(0, 0, 0) scale(${zoomLevel})`;
                clonedContentRef.current.style.transformOrigin = `${x}px ${y}px`;
            }

            if (frameRef.current) {
                frameRef.current.style.transform = `translate3d(${x - magnifierSize / 2
                    }px, ${y - magnifierSize / 2}px, 0)`;
            }

            if (magnifiedContentRef.current) {
                magnifiedContentRef.current.style.clipPath = `circle(${magnifierSize / 2 - 10
                    }px at ${x}px ${y}px)`;
            }

            setPosition({ x, y });
        };

        const handleMouseMove = (e) => {
            if (!isActive || ticking) return;

            const x = e.clientX;
            const y = e.clientY;

            ticking = true;
            rafRef.current = requestAnimationFrame(() => {
                updatePosition(x, y);
                ticking = false;
            });
        };

        if (isActive) {
            document.addEventListener("mousemove", handleMouseMove, {
                passive: true,
            });
            document.body.style.cursor = "none";

            // Clone content once when activated
            setTimeout(() => {
                const pageContent = document.getElementById("page-content");
                if (pageContent && clonedContentRef.current) {
                    // Deep clone the content
                    clonedContentRef.current.innerHTML = pageContent.innerHTML;

                    // Copy values of input elements manually (since innerHTML doesn't capture current values)
                    const originalInputs = pageContent.querySelectorAll('input, textarea, select');
                    const clonedInputs = clonedContentRef.current.querySelectorAll('input, textarea, select');

                    originalInputs.forEach((input, i) => {
                        if (clonedInputs[i]) {
                            if (input.type === 'checkbox' || input.type === 'radio') {
                                clonedInputs[i].checked = input.checked;
                            } else {
                                clonedInputs[i].value = input.value;
                            }
                        }
                    });

                    // Copy canvas content if any
                    const originalCanvases = pageContent.querySelectorAll('canvas');
                    const clonedCanvases = clonedContentRef.current.querySelectorAll('canvas');
                    originalCanvases.forEach((canvas, i) => {
                        if (clonedCanvases[i]) {
                            const ctx = clonedCanvases[i].getContext('2d');
                            ctx.drawImage(canvas, 0, 0);
                        }
                    });
                }
            }, 0);
        } else {
            document.body.style.cursor = "auto";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.body.style.cursor = "auto";
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [isActive, magnifierSize, zoomLevel]);

    const toggleMagnifier = useCallback(() => {
        setIsActive((prev) => !prev);
    }, []);

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleMagnifier}
                className={`magnifier-ui magnifying-glass-toggle fixed right-5 top-1/2 -translate-y-1/2 z-[10000] p-4 rounded-full shadow-lg transition-all duration-300 ${isActive
                        ? "bg-[#FFAE00] text-white scale-110"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                title="Toggle Magnifying Glass"
            >
                <Search className="w-6 h-6" />
            </button>

            {/* Magnifying Glass Lens */}
            {isActive && (
                <>
                    {/* Magnifying Circle Frame */}
                    <div
                        ref={frameRef}
                        className="magnifier-ui fixed pointer-events-none z-[10000]"
                        style={{
                            left: 0,
                            top: 0,
                            width: `${magnifierSize}px`,
                            height: `${magnifierSize}px`,
                            transform: `translate3d(${position.x - magnifierSize / 2}px, ${position.y - magnifierSize / 2
                                }px, 0)`,
                            willChange: "transform",
                        }}
                    >
                        {/* Outer glass frame */}
                        <div
                            className="relative w-full h-full rounded-full"
                            style={{
                                border: "10px solid #3a3a3a",
                                boxShadow: `
                  0 0 0 3px #555,
                  0 10px 40px rgba(0, 0, 0, 0.6),
                  inset 0 0 30px rgba(255, 255, 255, 0.1)
                `,
                                background:
                                    "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.15), transparent 50%)",
                            }}
                        >
                            {/* Inner glass shine */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: `
                    radial-gradient(
                      circle at 30% 30%,
                      rgba(255, 255, 255, 0.6) 0%,
                      rgba(255, 255, 255, 0.3) 15%,
                      rgba(255, 255, 255, 0.1) 30%,
                      transparent 55%
                    )
                  `,
                                    pointerEvents: "none",
                                }}
                            />

                            {/* Glass inner rim */}
                            <div
                                className="absolute inset-2 rounded-full"
                                style={{
                                    border: "2px solid rgba(255, 255, 255, 0.25)",
                                    boxShadow: "inset 0 0 15px rgba(0, 0, 0, 0.4)",
                                }}
                            />
                        </div>

                        {/* Magnifying glass handle */}
                        <div
                            className="absolute"
                            style={{
                                width: "12px",
                                height: "95px",
                                background:
                                    "linear-gradient(to right, #2a2a2a 0%, #4a4a4a 50%, #2a2a2a 100%)",
                                borderRadius: "6px",
                                left: "50%",
                                top: "100%",
                                transform: "translateX(-50%) rotate(45deg)",
                                transformOrigin: "top center",
                                boxShadow:
                                    "3px 3px 10px rgba(0, 0, 0, 0.7), inset 1px 0 0 rgba(255,255,255,0.2)",
                            }}
                        >
                            {/* Handle texture/grip */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: "15px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "8px",
                                    height: "65px",
                                    background:
                                        "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.4) 4px, rgba(0,0,0,0.4) 8px)",
                                    borderRadius: "4px",
                                }}
                            />

                            {/* Handle end cap */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "-8px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "18px",
                                    height: "18px",
                                    background: "radial-gradient(circle, #4a4a4a, #2a2a2a)",
                                    borderRadius: "50%",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.8)",
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Global styles for magnification effect */}
            {isActive && (
                <style dangerouslySetInnerHTML={{
                    __html: `
          /* Hide magnifier UI elements from being duplicated in magnified view */
          .magnifier-ui {
            z-index: 10000 !important;
          }
          
          /* Create magnified clone of page content */
          body::before {
            content: '';
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9998;
            clip-path: circle(${magnifierSize / 2 - 10}px at ${position.x}px ${position.y}px);
            will-change: clip-path;
          }
          
          /* Apply transform to the page content clone */
          #page-content {
            position: relative;
          }
          
          /* Magnified overlay using mix-blend-mode trick */
          .magnifier-overlay {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            pointer-events: none !important;
            z-index: 9998 !important;
            clip-path: circle(${magnifierSize / 2 - 10}px at ${position.x}px ${position.y}px) !important;
          }
          
          .magnifier-ui {
            z-index: 10000 !important;
          }
          
          #magnified-page-clone * {
            pointer-events: none !important;
          }
        `}} />
            )}

            {/* Magnified content portal */}
            {isActive && (
                <div
                    ref={magnifiedContentRef}
                    className="magnifier-overlay fixed left-0 top-0 pointer-events-none overflow-hidden"
                    style={{
                        width: "100vw",
                        height: "100vh",
                        zIndex: 9998,
                        clipPath: `circle(${magnifierSize / 2 - 10}px at ${position.x}px ${position.y
                            }px)`,
                        willChange: "clip-path",
                    }}
                >
                    <div
                        ref={clonedContentRef}
                        id="magnified-page-clone"
                        style={{
                            transform: `translate3d(0, 0, 0) scale(${zoomLevel})`,
                            transformOrigin: `${position.x}px ${position.y}px`,
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: "100vw",
                            height: "100vh",
                            pointerEvents: "none",
                            willChange: "transform",
                        }}
                    />
                </div>
            )}

            {/* Instructions overlay */}
            {isActive && (
                <div className="magnifier-ui fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] bg-black/80 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm">
                    Move your mouse to magnify the page • Click the button to disable
                </div>
            )}
        </>
    );
}

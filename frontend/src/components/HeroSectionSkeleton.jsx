// HeroSectionSkeleton.jsx
import React from "react";

export default function HeroSectionSkeleton() {
  return (
    <>
      <style>{`
        .skeleton-root {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            linear-gradient(to top, rgba(10,9,8,0.92) 0%, rgba(10,9,8,0.55) 50%, rgba(10,9,8,0.3) 100%),
            linear-gradient(135deg, #151311 0%, #1d1a17 45%, #13110f 100%);
        }

        .skeleton-root::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(201,168,76,.08), transparent 35%),
            radial-gradient(circle at 80% 70%, rgba(201,168,76,.05), transparent 40%);
        }

        .shimmer {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.08);
        }

        .shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.08),
            transparent
          );
          animation: shimmer 1.8s infinite;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .tab-pill-skeleton {
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.05);
          backdrop-filter: blur(10px);
        }

        .search-card-skeleton {
          background: rgba(15,14,13,0.72);
          border: 1px solid rgba(255,255,255,.12);
          backdrop-filter: blur(28px);
          border-radius: 24px;
          padding: 36px 40px 40px;
          margin-top: 8px;
        }

        .field-block {
          flex: 1;
          min-width: 220px;
        }

        .divider-skeleton {
          width: 1px;
          height: 56px;
          background: rgba(255,255,255,.08);
          margin: 0 20px;
        }

        .dot-skeleton {
          height: 6px;
          border-radius: 999px;
          background: rgba(255,255,255,.18);
        }

        @media (max-width: 768px) {
          .search-card-skeleton {
            padding: 24px 20px 28px;
          }

          .divider-skeleton {
            display: none;
          }

          .field-block {
            min-width: 100%;
          }
        }
      `}</style>

      <section className="skeleton-root">
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "80px 24px 60px",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "22px",
              }}
            >
              <div
                className="shimmer"
                style={{
                  width: "34px",
                  height: "1px",
                  background: "#C9A84C",
                }}
              />
              <div
                className="shimmer"
                style={{
                  width: "180px",
                  height: "12px",
                  borderRadius: "999px",
                  background: "rgba(201,168,76,.25)",
                }}
              />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: "42px" }}>
              <div
                className="shimmer"
                style={{
                  width: "min(720px, 85%)",
                  height: "72px",
                  borderRadius: "14px",
                  marginBottom: "16px",
                  background: "rgba(255,255,255,.10)",
                }}
              />
              <div
                className="shimmer"
                style={{
                  width: "min(580px, 75%)",
                  height: "18px",
                  borderRadius: "999px",
                  marginBottom: "10px",
                }}
              />
              <div
                className="shimmer"
                style={{
                  width: "min(420px, 55%)",
                  height: "18px",
                  borderRadius: "999px",
                }}
              />
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "36px",
              }}
            >
              {[120, 110, 110, 145, 120].map((width, index) => (
                <div
                  key={index}
                  className="tab-pill-skeleton shimmer"
                  style={{ width }}
                />
              ))}
            </div>

            {/* Search Card */}
            <div className="search-card-skeleton">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                }}
              >
                {/* Destination */}
                <div className="field-block">
                  <div
                    className="shimmer"
                    style={{
                      width: "90px",
                      height: "10px",
                      borderRadius: "999px",
                      marginBottom: "12px",
                    }}
                  />
                  <div
                    className="shimmer"
                    style={{
                      width: "100%",
                      height: "54px",
                      borderRadius: "14px",
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.08)",
                    }}
                  />
                </div>

                <div className="divider-skeleton" />

                {/* Check In */}
                <div className="field-block">
                  <div
                    className="shimmer"
                    style={{
                      width: "70px",
                      height: "10px",
                      borderRadius: "999px",
                      marginBottom: "12px",
                    }}
                  />
                  <div
                    className="shimmer"
                    style={{
                      width: "100%",
                      height: "54px",
                      borderRadius: "14px",
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.08)",
                    }}
                  />
                </div>

                <div className="divider-skeleton" />

                {/* Check Out */}
                <div className="field-block">
                  <div
                    className="shimmer"
                    style={{
                      width: "78px",
                      height: "10px",
                      borderRadius: "999px",
                      marginBottom: "12px",
                    }}
                  />
                  <div
                    className="shimmer"
                    style={{
                      width: "100%",
                      height: "54px",
                      borderRadius: "14px",
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.08)",
                    }}
                  />
                </div>

                {/* Button */}
                <div
                  style={{
                    marginLeft: "auto",
                    paddingLeft: "20px",
                    paddingTop: "24px",
                  }}
                >
                  <div
                    className="shimmer"
                    style={{
                      width: "150px",
                      height: "54px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, rgba(201,168,76,.35), rgba(184,131,42,.25))",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "28px",
              }}
            >
              {[150, 170, 160].map((width, index) => (
                <div
                  key={index}
                  className="shimmer"
                  style={{
                    width,
                    height: "42px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Slide Dots */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "32px",
            display: "flex",
            gap: "8px",
            zIndex: 10,
          }}
        >
          <div
            className="dot-skeleton shimmer"
            style={{ width: "28px", background: "rgba(255,255,255,.4)" }}
          />
          <div className="dot-skeleton shimmer" style={{ width: "6px" }} />
          <div className="dot-skeleton shimmer" style={{ width: "6px" }} />
          <div className="dot-skeleton shimmer" style={{ width: "6px" }} />
        </div>
      </section>
    </>
  );
}
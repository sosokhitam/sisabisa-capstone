import re
from collections import Counter

import pandas as pd
import streamlit as st
import plotly.express as px

# =====================================================
# CONFIG
# =====================================================
st.set_page_config(
    page_title="Dashboard SisaBisa",
    page_icon="🥬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =====================================================
# CUSTOM CSS - SAAS STYLE
# =====================================================
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }
    .stApp { background: linear-gradient(135deg, #f5fbf7 0%, #eef8ff 50%, #f8fbff 100%); }
    section[data-testid="stSidebar"] { background: rgba(255,255,255,.86); border-right: 1px solid rgba(148,163,184,.25); backdrop-filter: blur(18px); }
    .main .block-container { padding-top: 2rem; padding-bottom: 3rem; max-width: 1300px; }
    .hero-card { padding: 34px 38px; border-radius: 28px; background: linear-gradient(135deg, #0f766e 0%, #22c55e 52%, #38bdf8 100%); box-shadow: 0 24px 70px rgba(15,118,110,.25); color: white; margin-bottom: 24px; position: relative; overflow: hidden; }
    .hero-card::after { content:""; position:absolute; width:320px; height:320px; border-radius:999px; right:-90px; top:-120px; background:rgba(255,255,255,.18); }
    .hero-title { font-size: 44px; line-height: 1.05; font-weight: 800; letter-spacing: -1.4px; margin-bottom: 10px; }
    .hero-subtitle { font-size: 16px; opacity: .95; max-width: 760px; line-height: 1.65; }
    .metric-card { padding: 22px 22px; border-radius: 22px; background: rgba(255,255,255,.88); border: 1px solid rgba(148,163,184,.24); box-shadow: 0 14px 40px rgba(15,23,42,.06); min-height: 132px; }
    .metric-label { color:#64748b; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; }
    .metric-value { color:#0f172a; font-size:34px; font-weight:800; letter-spacing:-.8px; margin-bottom:6px; }
    .metric-help { color:#0f766e; font-size:13px; font-weight:600; }
    .section-title { font-size:26px; font-weight:800; color:#0f172a; margin-top:12px; margin-bottom:4px; letter-spacing:-.5px; }
    .section-caption { color:#64748b; font-size:14px; margin-bottom:18px; }
    .insight-card { padding:18px 20px; border-radius:18px; background:#ecfdf5; border:1px solid #bbf7d0; color:#14532d; font-size:14px; line-height:1.6; margin-top:10px; margin-bottom:16px; }
    .warning-card { padding:18px 20px; border-radius:18px; background:#fff7ed; border:1px solid #fed7aa; color:#7c2d12; font-size:14px; line-height:1.6; margin-top:10px; margin-bottom:16px; }
    div[data-testid="stTabs"] button { font-weight:700; border-radius:999px; padding:10px 18px; }
    .stDataFrame { border-radius:18px; overflow:hidden; }
    </style>
    """,
    unsafe_allow_html=True
)

# =====================================================
# DATASET DARI GITHUB
# =====================================================

BAHAN_PATH = "https://raw.githubusercontent.com/S4nd1Dev/SisaBisa/main/data-science/data/fix_bahan_clean_translate.csv"

RESEP_PATH = "https://raw.githubusercontent.com/S4nd1Dev/SisaBisa/main/data-science/data/dataset_resep_format_final.xlsx"

# =====================================================
# LOAD DATA
# =====================================================
@st.cache_data
def load_data(bahan_path: str, resep_path: str):
    bahan = pd.read_csv(bahan_path)
    resep = pd.read_excel(resep_path)
    return bahan, resep

try:
    df_bahan, df_resep = load_data(BAHAN_PATH, RESEP_PATH)
except Exception as e:
    st.error(f"Gagal membaca data: {e}")
    st.stop()

# =====================================================
# HELPER
# =====================================================
def normalize_text_value(value: str) -> str:
    return str(value).strip().lower()


def normalize_text(series: pd.Series) -> pd.Series:
    return series.astype(str).str.strip().str.lower()


def find_column(df: pd.DataFrame, candidates: list[str]):
    """Cari nama kolom secara fleksibel: exact match dulu, lalu contains."""
    cols_lower = {c.lower().strip(): c for c in df.columns}
    for cand in candidates:
        key = cand.lower().strip()
        if key in cols_lower:
            return cols_lower[key]

    for cand in candidates:
        key = cand.lower().strip().replace("_", " ")
        for col in df.columns:
            col_norm = col.lower().strip().replace("_", " ")
            if key in col_norm:
                return col
    return None


def split_ingredients(value):
    """Pisahkan bahan yang berada dalam satu sel berdasarkan koma."""
    if pd.isna(value):
        return []

    text = str(value)
    text = text.replace("[", "").replace("]", "")
    text = text.replace("'", "").replace('"', "")
    text = text.replace(";", ",")

    items = [normalize_text_value(x) for x in text.split(",")]
    return [x for x in items if x and x != "nan"]


def clean_bahan(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    required_cols = {"category", "item", "storage", "days"}
    missing = required_cols - set(df.columns)
    if missing:
        st.error(f"Dataset bahan kurang kolom: {missing}")
        st.stop()
    for col in ["category", "item", "storage"]:
        df[col] = df[col].astype(str).str.strip()
    df["days"] = pd.to_numeric(df["days"], errors="coerce")
    df = df.dropna(subset=["days"])
    df["days"] = df["days"].astype(int)
    return df


def get_recipe_ingredient_column(df_resep: pd.DataFrame):
    return find_column(
        df_resep,
        [
            "bahan_list", "ingredients_list", "ingredient_list",
            "ingredients cleaned", "ingredients_cleaned", "bahan cleaned", "bahan_cleaned",
            "ingredients", "ingredient", "bahan", "item"
        ]
    )


def prepare_recipe_frequency(df_resep: pd.DataFrame) -> pd.DataFrame:
    """Membuat frekuensi bahan. Jika bahan dalam satu sel dipisah koma, akan dipecah dulu."""
    ingredient_col = get_recipe_ingredient_column(df_resep)
    if ingredient_col is None:
        return pd.DataFrame(columns=["bahan", "frekuensi"])

    all_bahan = []
    for val in df_resep[ingredient_col].dropna():
        all_bahan.extend(split_ingredients(val))

    if not all_bahan:
        return pd.DataFrame(columns=["bahan", "frekuensi"])

    freq = pd.DataFrame(Counter(all_bahan).items(), columns=["bahan", "frekuensi"])
    return freq.sort_values("frekuensi", ascending=False).reset_index(drop=True)


def prepare_recipe_ingredient_count(df_resep: pd.DataFrame) -> pd.DataFrame:
    """Menghitung jumlah bahan per resep berdasarkan pemisah koma."""
    ingredient_col = get_recipe_ingredient_column(df_resep)
    if ingredient_col is None:
        return pd.DataFrame(columns=["jumlah_bahan"])

    counts = []
    for val in df_resep[ingredient_col].dropna():
        counts.append(len(split_ingredients(val)))

    return pd.DataFrame({"jumlah_bahan": counts})


def metric_card(label: str, value: str, help_text: str = ""):
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">{label}</div>
            <div class="metric-value">{value}</div>
            <div class="metric-help">{help_text}</div>
        </div>
        """,
        unsafe_allow_html=True
    )


def section_header(title: str, caption: str):
    st.markdown(f'<div class="section-title">{title}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="section-caption">{caption}</div>', unsafe_allow_html=True)


def insight(text: str):
    st.markdown(f'<div class="insight-card">💡 {text}</div>', unsafe_allow_html=True)

# =====================================================
# BASIC DATA PREP
# =====================================================
df_bahan = clean_bahan(df_bahan)
df_bahan_freq = prepare_recipe_frequency(df_resep)
ingredient_count = prepare_recipe_ingredient_count(df_resep)

bumbu_dasar = {
    'garam', 'penyedap rasa', 'air', 'minyak goreng', 'lada putih',
    'lada hitam', 'merica', 'gula pasir', 'gula merah', 'kecap manis',
    'kecap asin', 'bawang putih', 'bawang merah', 'bawang bombai',
    'jahe', 'lengkuas', 'serai', 'kemiri', 'kunyit', 'ketumbar',
    'daun salam', 'daun jeruk', 'daun bawang', 'cabai rawit',
    'cabai merah', 'cabai hijau', 'cabai keriting', 'tomat merah',
    'jintan', 'kapulaga', 'kayu manis', 'cengkeh', 'pala',
    'bunga lawang', 'asam jawa', 'terasi', 'kencur', 'air jeruk',
    'minyak wijen', 'saus tiram', 'saus tomat', 'saus sambal',
    'mayones', 'cuka', 'tepung terigu', 'tepung maizena', 'tepung serbaguna',
    'tepung tapioka', 'bumbu', 'susu kental manis', 'santan', 'gula',
    'jeruk nipis', 'margarin', 'cengkih', 'mentega', 'bawang goreng', 'beras'
}

if not df_bahan_freq.empty:
    df_bahan_utama = df_bahan_freq[~df_bahan_freq["bahan"].isin(bumbu_dasar)].copy()
else:
    df_bahan_utama = pd.DataFrame(columns=["bahan", "frekuensi"])

# =====================================================
# SIDEBAR FILTER
# =====================================================
st.sidebar.markdown("## 🥬 SisaBisa")
st.sidebar.caption("Dashboard analitik umur simpan bahan dan pola resep Indonesia.")
st.sidebar.markdown("---")

category_options = sorted(df_bahan["category"].dropna().unique())
storage_options = sorted(df_bahan["storage"].dropna().unique())

selected_categories = st.sidebar.multiselect(
    "Kategori bahan",
    category_options,
    default=category_options
)

selected_storages = st.sidebar.multiselect(
    "Metode penyimpanan",
    storage_options,
    default=storage_options
)

top_n = st.sidebar.slider("Jumlah bahan populer", 5, 30, 15)
st.sidebar.markdown("---")
st.sidebar.caption("Tips: gunakan filter untuk melihat insight per kategori atau storage.")

filtered_bahan = df_bahan[
    df_bahan["category"].isin(selected_categories) &
    df_bahan["storage"].isin(selected_storages)
].copy()

# =====================================================
# HERO
# =====================================================
st.markdown(
    """
    <div class="hero-card">
        <div class="hero-title">Dashboard SisaBisa</div>
        <div class="hero-subtitle">
            Analisis interaktif umur simpan bahan makanan dan pola penggunaan bahan pada resep Indonesia
            untuk mendukung prioritas masak, pengurangan food waste, dan rekomendasi resep berbasis data.
        </div>
    </div>
    """,
    unsafe_allow_html=True
)

# =====================================================
# METRIC CARDS
# =====================================================
col1, col2, col3, col4 = st.columns(4)
with col1:
    metric_card("Bahan", f"{df_bahan['item'].nunique():,}", "jumlah bahan unik")
with col2:
    metric_card("Kategori", f"{df_bahan['category'].nunique():,}", "kelompok bahan")
with col3:
    metric_card("Storage", f"{df_bahan['storage'].nunique():,}", "freezer, kulkas, suhu")
with col4:
    total_resep = len(df_resep)
    metric_card("Resep", f"{total_resep:,}", "jumlah resep pada dataset")

st.markdown("<div style='height:18px;'></div>", unsafe_allow_html=True)

col5, col6 = st.columns(2)

with col5:
    unique_resep_ing = df_bahan_freq["bahan"].nunique() if not df_bahan_freq.empty else 0
    metric_card("Bahan di Resep", f"{unique_resep_ing:,}")
with col6:
    avg_ing = ingredient_count["jumlah_bahan"].mean() if not ingredient_count.empty else 0
    metric_card("Rata-rata Bahan/Resep", f"{avg_ing:.1f}")

# =====================================================
# TABS
# =====================================================
tab_overview, tab_shelf, tab_recipe, tab_priority, tab_data = st.tabs([
    "📊 Overview",
    "⏳ Umur Simpan",
    "🍳 Resep",
    "🚀 Prioritas Aksi",
    "📄 Data"
])

# =====================================================
# TAB OVERVIEW
# =====================================================
with tab_overview:
    section_header(
        "Ringkasan Distribusi Dataset",
        "Melihat komposisi data berdasarkan kategori bahan dan metode penyimpanan."
    )

    c1, c2 = st.columns([1.2, 1])

    with c1:
        category_count = filtered_bahan["category"].value_counts().reset_index()
        category_count.columns = ["category", "jumlah"]
        fig = px.bar(
            category_count.sort_values("jumlah"),
            x="jumlah",
            y="category",
            orientation="h",
            text="jumlah",
            color="jumlah",
            color_continuous_scale="Tealgrn",
            title="Distribusi Data per Kategori"
        )
        fig.update_layout(height=480, title_font_size=18, plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig, use_container_width=True)

    with c2:
        storage_count = filtered_bahan["storage"].value_counts().reset_index()
        storage_count.columns = ["storage", "jumlah"]
        fig = px.pie(
            storage_count,
            names="storage",
            values="jumlah",
            hole=.55,
            title="Proporsi Storage"
        )
        fig.update_traces(textposition="inside", textinfo="percent+label")
        fig.update_layout(height=480, title_font_size=18, paper_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig, use_container_width=True)

    insight("Distribusi kategori dan storage membantu memastikan analisis tidak hanya didominasi oleh satu jenis bahan atau satu metode penyimpanan saja.")

# =====================================================
# TAB SHELF LIFE
# =====================================================
with tab_shelf:
    section_header(
        "Analisis Umur Simpan Bahan",
        "Mengidentifikasi metode penyimpanan dan kategori bahan yang paling berpengaruh terhadap umur simpan."
    )

    storage_stats = (
        filtered_bahan
        .groupby("storage")["days"]
        .agg(rata_rata="mean", median="median", min="min", max="max", jumlah="count")
        .reset_index()
    )
    storage_stats["rata_rata"] = storage_stats["rata_rata"].round(1)
    storage_stats["median"] = storage_stats["median"].round(1)

    category_stats = (
        filtered_bahan
        .groupby("category")["days"]
        .agg(rata_rata="mean", median="median", jumlah="count")
        .reset_index()
    )
    category_stats["rata_rata"] = category_stats["rata_rata"].round(1)
    category_stats["median"] = category_stats["median"].round(1)

    c1, c2 = st.columns([1, 1])

    with c1:
        fig = px.bar(
            storage_stats.sort_values("rata_rata", ascending=False),
            x="storage",
            y="rata_rata",
            text="rata_rata",
            color="rata_rata",
            color_continuous_scale="Blues",
            title="Rata-rata Umur Simpan per Storage"
        )
        fig.update_layout(height=430, plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig, use_container_width=True)

    with c2:
        fig = px.box(
            filtered_bahan,
            x="storage",
            y="days",
            color="storage",
            title="Sebaran Umur Simpan Berdasarkan Storage"
        )
        fig.update_layout(height=430, showlegend=False, plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig, use_container_width=True)

    st.dataframe(storage_stats, use_container_width=True)

    c3, c4 = st.columns([1.25, .9])
    with c3:
        fig = px.bar(
            category_stats.sort_values("rata_rata"),
            x="rata_rata",
            y="category",
            orientation="h",
            text="rata_rata",
            color="rata_rata",
            color_continuous_scale="Sunsetdark",
            title="Kategori dengan Umur Simpan Rata-rata Terpendek"
        )
        fig.update_layout(height=520, plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig, use_container_width=True)

    with c4:
        fastest = category_stats.sort_values("rata_rata").head(5)
        st.markdown("### Kategori prioritas")
        st.dataframe(fastest, use_container_width=True)
        insight("Kategori dengan umur simpan rendah dapat diprioritaskan dalam sistem rekomendasi resep dan notifikasi bahan hampir kedaluwarsa.")

# =====================================================
# TAB RECIPE
# =====================================================
with tab_recipe:

    section_header(
        "Pola Penggunaan Bahan pada Resep",
        "Analisis bahan yang paling sering digunakan dan tingkat kompleksitas resep Indonesia."
    )

    if df_bahan_utama.empty:
        st.markdown(
            '<div class="warning-card">Dataset resep belum memiliki kolom bahan yang dapat dikenali.</div>',
            unsafe_allow_html=True
        )
    else:
        top_bahan = df_bahan_utama.head(top_n)
        c1, c2 = st.columns([1.25, .9])

        with c1:
            fig = px.bar(
                top_bahan.sort_values("frekuensi"),
                x="frekuensi",
                y="bahan",
                orientation="h",
                text="frekuensi",
                color="frekuensi",
                color_continuous_scale="Teal",
                title=f"Top {top_n} Bahan Utama Paling Sering Dipakai"
            )
            fig.update_layout(height=560, plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)")
            st.plotly_chart(fig, use_container_width=True)

        with c2:
            st.markdown("### Tabel bahan populer")
            st.dataframe(top_bahan, use_container_width=True)
            insight("Tabel ini sudah menghitung bahan satu per satu setelah kolom bahan resep dipisahkan berdasarkan koma.")

    st.markdown("---")

    if ingredient_count.empty:
        st.markdown(
            '<div class="warning-card">Jumlah bahan per resep belum dapat dihitung. Pastikan ada kolom bahan, ingredients, atau bahan_list.</div>',
            unsafe_allow_html=True
        )
    else:
        st.markdown("### 🍳 Recipe Complexity Analytics")

        avg_ing = ingredient_count["jumlah_bahan"].mean()
        median_ing = ingredient_count["jumlah_bahan"].median()
        max_ing = ingredient_count["jumlah_bahan"].max()
        common_ing = ingredient_count["jumlah_bahan"].mode()[0]

        k1, k2, k3, k4 = st.columns(4)
        k1.metric("🍽 Avg Ingredients", f"{avg_ing:.1f}")
        k2.metric("📊 Median", f"{median_ing:.0f}")
        k3.metric("🔥 Max", f"{max_ing:.0f}")
        k4.metric("⭐ Most Common", f"{common_ing:.0f}")

        st.markdown("<br>", unsafe_allow_html=True)

        bins = [0, 5, 10, 15, 20, 30, 100]
        labels = ["1–5 bahan", "6–10 bahan", "11–15 bahan", "16–20 bahan", "21–30 bahan", ">30 bahan"]

        ingredient_count["bucket_jumlah_bahan"] = pd.cut(
            ingredient_count["jumlah_bahan"],
            bins=bins,
            labels=labels,
            right=True
        )

        bucket_stats = (
            ingredient_count["bucket_jumlah_bahan"]
            .value_counts()
            .reindex(labels)
            .reset_index()
        )

        bucket_stats.columns = ["bucket", "jumlah_resep"]
        bucket_stats["persentase"] = (
            bucket_stats["jumlah_resep"] / bucket_stats["jumlah_resep"].sum() * 100
        ).round(1)

        chart_left, chart_right = st.columns([1.15, 1])

        with chart_left:
            fig_bucket = px.bar(
                bucket_stats,
                x="bucket",
                y="jumlah_resep",
                text="persentase",
                color="jumlah_resep",
                color_continuous_scale="Tealgrn",
                title="Distribusi Resep per Bucket Jumlah Bahan"
            )
            fig_bucket.update_traces(texttemplate="%{text}%", textposition="outside")
            fig_bucket.update_layout(
                height=460,
                xaxis_title="Bucket Jumlah Bahan",
                yaxis_title="Jumlah Resep",
                title_font_size=20,
                showlegend=False,
                coloraxis_showscale=False,
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)"
            )
            st.plotly_chart(fig_bucket, use_container_width=True)

        with chart_right:
            import numpy as np
            import plotly.graph_objects as go

            data_jumlah = ingredient_count["jumlah_bahan"].dropna()

            mean_val = data_jumlah.mean()
            median_val = data_jumlah.median()
            std_val = data_jumlah.std()
            min_val = data_jumlah.min()
            max_val = data_jumlah.max()

            x_norm = np.linspace(min_val, max_val, 300)
            y_norm = (
                1 / (std_val * np.sqrt(2 * np.pi))
                * np.exp(-0.5 * ((x_norm - mean_val) / std_val) ** 2)
            )

            fig_dist = go.Figure()
            fig_dist.add_trace(
                go.Histogram(
                    x=data_jumlah,
                    histnorm="probability density",
                    nbinsx=30,
                    marker=dict(color="#14B8A6"),
                    opacity=0.75
                )
            )
            fig_dist.add_trace(
                go.Scatter(
                    x=x_norm,
                    y=y_norm,
                    mode="lines",
                    line=dict(color="#EF4444", width=3)
                )
            )
            fig_dist.add_vline(x=mean_val, line_dash="dash", line_color="#2563EB")
            fig_dist.add_vline(x=median_val, line_dash="dot", line_color="#F59E0B")

            fig_dist.update_layout(
                height=460,
                title="Distribusi Jumlah Bahan per Resep",
                title_font_size=20,
                xaxis_title="Jumlah Bahan per Resep",
                yaxis_title="Density",
                bargap=0.05,
                showlegend=False,
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)"
            )
            st.plotly_chart(fig_dist, use_container_width=True)

            st.markdown(
                f"""
                <div class="insight-card">
                    <b>Statistik Distribusi:</b><br>
                    Mean: <b>{mean_val:.1f}</b> bahan &nbsp; | &nbsp;
                    Median: <b>{median_val:.0f}</b> bahan &nbsp; | &nbsp;
                    Std Dev: <b>{std_val:.1f}</b> &nbsp; | &nbsp;
                    Rentang: <b>{min_val:.0f}–{max_val:.0f}</b> bahan
                </div>
                """,
                unsafe_allow_html=True
            )

        dominant_bucket = (
            bucket_stats
            .sort_values("jumlah_resep", ascending=False)
            .iloc[0]["bucket"]
        )

        insight(
            f"""
Mayoritas resep berada pada bucket **{dominant_bucket}**.
Distribusi jumlah bahan menunjukkan bahwa sebagian besar resep terkonsentrasi
pada rentang bahan menengah, sehingga cocok untuk sistem rekomendasi resep
yang praktis namun tetap variatif.
"""
        )

# =====================================================
# TAB PRIORITY
# =====================================================
with tab_priority:
    section_header(
        "Prioritas Aksi untuk Mengurangi Food Waste",
        "Mengubah insight EDA menjadi rekomendasi bisnis dan arah fitur produk."
    )

    kulkas_df = df_bahan[df_bahan["storage"].str.lower().eq("kulkas")].copy()
    if not kulkas_df.empty:
        risk = (
            kulkas_df.groupby(["category", "item"], as_index=False)["days"]
            .mean()
            .rename(columns={"days": "umur_kulkas"})
            .sort_values("umur_kulkas")
            .head(15)
        )
        risk["umur_kulkas"] = risk["umur_kulkas"].round(1)

        c1, c2 = st.columns([1.2, .9])
        with c1:
            plot_df = risk.sort_values("umur_kulkas", ascending=False)

            fig = px.scatter(
                plot_df,
                x="umur_kulkas",
                y="item",
                size="umur_kulkas",
                color="umur_kulkas",
                color_continuous_scale=[
                    [0.0, "#7f1d1d"],
                    [0.5, "#dc2626"],
                    [1.0, "#fca5a5"]
                ],
                text="umur_kulkas",
                title="Bahan dengan Umur Simpan Kulkas Terpendek"
            )

            for _, row in plot_df.iterrows():
                fig.add_shape(
                    type="line",
                    x0=0,
                    x1=row["umur_kulkas"],
                    y0=row["item"],
                    y1=row["item"],
                    line=dict(color="rgba(220,38,38,0.35)", width=4)
                )

            fig.update_traces(
                marker=dict(line=dict(width=2, color="white")),
                textposition="middle right"
            )

            fig.update_layout(
                height=540,

                xaxis_title="Umur simpan kulkas (hari)",
                yaxis_title="Bahan",

                # background chart
                paper_bgcolor="rgba(255,255,255,0.88)",
                plot_bgcolor="rgba(255,255,255,0.88)",

                font=dict(color="#0f172a"),

                coloraxis_showscale=False,

                margin=dict(l=20, r=20, t=60, b=20)
            )

            fig.update_xaxes(range=[0, plot_df["umur_kulkas"].max() + 0.5])

            st.plotly_chart(fig, use_container_width=True)
        with c2:
            st.markdown("### Bahan prioritas")
            st.dataframe(risk, use_container_width=True)
            insight("Bahan dengan umur kulkas pendek sebaiknya masuk prioritas rekomendasi masak dan pengingat sebelum kedaluwarsa.")

    st.markdown("### Rekomendasi Produk")
    r1, r2, r3 = st.columns(3)
    with r1:
        metric_card("Fitur 1", "Kulkas Virtual", "monitor stok bahan")
    with r2:
        metric_card("Fitur 2", "Prioritas Masak", "urut dari bahan yang masa kadaluwarsa paling dekat")
    with r3:
        metric_card("Fitur 3", "Rekomendasi Resep", "berbasis bahan tersedia")

# =====================================================
# TAB DATA
# =====================================================
with tab_data:
    section_header("Preview Dataset", "Menampilkan data final yang dipakai dashboard.")

    with st.expander("📄 Data bahan"):
        st.dataframe(filtered_bahan, use_container_width=True)

    with st.expander("📄 Data resep"):
        st.dataframe(df_resep.head(200), use_container_width=True)

    with st.expander("📌 Business Questions"):
        st.markdown(
            """
            1. Berapa estimasi umur simpan rata-rata bahan makanan berdasarkan metode penyimpanan?  
            2. Kategori bahan mana yang paling cepat kedaluwarsa dan berisiko tinggi terbuang?  
            3. Apakah metode penyimpanan berpengaruh signifikan terhadap umur simpan bahan makanan?  
            4. Seberapa seimbang distribusi data per metode penyimpanan dan per kategori?  
            5. Bahan utama apa yang paling sering dipakai di resep?  
            6. Berapa rata-rata jumlah bahan per resep?  
            """
        )

st.markdown("---")
st.caption("Dashboard SisaBisa")

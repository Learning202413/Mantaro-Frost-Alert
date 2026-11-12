import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, hex_color):
    """Set the background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tc_pr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    """Set internal padding for table cells."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tc_mar.append(node)
    tc_pr.append(tc_mar)

def create_full_documentation(output_path="Documentacion_Sistema_Heladas_Mantaro_Completo.docx"):
    doc = Document()
    
    # Page setup - Margins (Normal: 1 inch / 2.54 cm)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
    
    # Palette
    PRIMARY = RGBColor(15, 76, 129)     # Deep Navy / Classic Blue
    SECONDARY = RGBColor(14, 116, 144)  # Cyan Dark
    DARK_TEXT = RGBColor(30, 41, 59)    # Slate 800
    MUTED_TEXT = RGBColor(100, 116, 139)# Slate 500
    BG_HEADER = "0F4C81"
    BG_ZEBRA = "F1F5F9"
    BG_CALLOUT = "F0F9FF"
    BG_WARN = "FEF3C7"

    # Helpers
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.color.rgb = PRIMARY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.color.rgb = SECONDARY
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = DARK_TEXT
        return p

    def add_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.name = "Calibri"
            rb.font.size = Pt(10.5)
            rb.font.bold = True
            rb.font.color.rgb = DARK_TEXT
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10.5)
        r.font.color.rgb = DARK_TEXT
        return p

    def add_callout(text, bold_prefix="Nota Clave: ", bg=BG_CALLOUT, text_color=SECONDARY):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_background(cell, bg)
        set_cell_margins(cell, top=130, bottom=130, left=180, right=180)
        cell.width = Inches(6.5)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        rb = p.add_run(bold_prefix)
        rb.font.name = "Calibri"
        rb.font.size = Pt(10)
        rb.font.bold = True
        rb.font.color.rgb = text_color
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = DARK_TEXT
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================================
    # COVER / HEADER
    # ==========================================
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_title = title.add_run("SISTEMA DE ALERTA TEMPRANA DE HELADAS EN EL VALLE DEL MANTARO")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = PRIMARY
    
    sub = doc.add_paragraph()
    r_sub = sub.add_run("Documentación Técnica Integral: Pipeline en Google Colab, Imputación, Modelos Comparados, Clean Architecture y Despliegue en la Nube")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(13)
    r_sub.font.italic = True
    r_sub.font.color.rgb = SECONDARY
    
    meta = doc.add_paragraph()
    r_meta = meta.add_run("Cátedra de Construcción de Software (2026-II) • Hackathon v02 • Versión 2.0 Definitiva")
    r_meta.font.name = "Calibri"
    r_meta.font.size = Pt(10)
    r_meta.font.color.rgb = MUTED_TEXT

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ==========================================
    # 1. RESUMEN EJECUTIVO
    # ==========================================
    add_h1("1. Resumen Ejecutivo del Proyecto")
    add_p(
        "En el Valle del Mantaro (Junín, Perú), ubicado a una altitud promedio de 3,250 a 3,350 msnm, las heladas "
        "nocturnas representan uno de los fenómenos más devastadores para la economía agrícola de la sierra central. "
        "Durante los meses de estiaje (mayo a julio), la extrema sequedad del aire y los cielos completamente despejados "
        "favorecen la pérdida rápida de calor por radiación hacia el espacio, desplomando las temperaturas bajo 0 °C "
        "antes del amanecer."
    )
    add_p(
        "Este sistema de software resuelve el problema con un enfoque preventivo anticipado: tomando mediciones atmosféricas "
        "al corte estricto de las 18:00 h (6:00 PM), predice con 11 horas de ventaja la temperatura mínima exacta que se "
        "alcanzará a las 05:30 AM en la madrugada siguiente, emitiendo alertas semafóricas operativas (Roja, Amarilla, Verde) "
        "y protocolos de mitigación térmica."
    )

    # ==========================================
    # 2. PIPELINE EN GOOGLE COLAB
    # ==========================================
    add_h1("2. El Pipeline de Machine Learning en Google Colab (Paso a Paso)")
    add_p(
        "En Google Colab se construyó una tubería de datos (pipeline) completamente reproducible, sin trucos estadísticos "
        "ni mezclas indebidas entre pasado y futuro. A continuación se desglosan todos los pasos técnicos explicados de forma didáctica:"
    )

    add_h2("Paso 1: Ingesta y Consolidación de Fuentes de Datos")
    add_p(
        "Se utilizaron dos fuentes primarias de alta fidelidad meteorológica:",
        bold_prefix="Fuentes Reales: "
    )
    add_p(
        "1. Dataset Histórico de la Estación Meteorológica Automática (EMA) Huayao del Instituto Geofísico del Perú (IGP): "
        "Ubicada en el distrito de Huachac, provincia de Chupaca (UBIGEO 120904, a 3,314 msnm). Abarca mediciones horarias reales "
        "desde el año 2018 hasta 2025 (más de 70,000 filas con temperatura, humedad, presión, viento y precipitación)."
    )
    add_p(
        "2. Open-Meteo Historical Forecast API: "
        "Para calibrar el modelo con las mismas variables satelitales numéricas (ECMWF/GFS) que se consumirán en el despliegue de producción."
    )

    add_h2("Paso 2: Limpieza de Ruido y Detección de Fallas en Sensores")
    add_p(
        "Las estaciones meteorológicas en campo sufren cortes de energía, polvo en los higrómetros y desconexiones de sensores. "
        "En Colab se realizó un filtrado estricto de límites físicos:"
    )
    add_p("• Humedad Relativa (HR): Se descartaron valores anómalos de 0% o negativos producidos por caídas del higrómetro, acotando el rango válido entre 5% y 100%.")
    add_p("• Presión Atmosférica (PP): A la altitud del valle (3,314 msnm), la presión normal oscila alrededor de 685-695 hPa. Se descartaron lecturas espurias fuera del intervalo físico de 500 a 850 hPa.")
    add_p("• Velocidad del Viento (FF): Se sanearon velocidades negativas producidas por ruido electromagnético en el anemómetro.")

    add_h2("Paso 3: Estrategia de Imputación de Datos Faltantes (¿Qué y Cómo se Imputó?)")
    add_p(
        "Un modelo en producción no puede caerse con un error 'NaN' (Not a Number) si una ráfaga de viento desconecta un sensor "
        "justo a las 17:50 h. Por eso se diseñó una estrategia de imputación en dos niveles:"
    )
    add_h3("A. Nivel 1: Interpolación Temporal para Vacíos Breves (Pandas en Colab)")
    add_p(
        "Cuando faltaban 1 o 2 horas consecutivas de un sensor (por ejemplo, corte breve a las 16:00 h), se aplicó "
        "interpolación lineal temporal basada en la hora ('method=\"time\"'). Esto asume que si la temperatura a las 15:00 h era 14 °C "
        "y a las 17:00 h era 10 °C, la de las 16:00 h fue aproximadamente 12 °C, respetando la curva natural de caída vespertina."
    )
    add_h3("B. Nivel 2: SimpleImputer con Mediana dentro del Pipeline de Scikit-Learn")
    add_p(
        "Para el empaquetado final del modelo en producción, se incorporó 'SimpleImputer(strategy=\"median\")' al inicio del Pipeline. "
        "¿Por qué la mediana y no el promedio? Porque la mediana es inmune a valores extremos atípicos (outliers). "
        "Si en un día de lluvia o granizo un sensor falla completamente, el SimpleImputer autocompleta el campo con la mediana "
        "histórica de las 18:00 h de esa estación, permitiendo que el modelo entregue un pronóstico razonable en lugar de fallar."
    )
    add_h3("C. Escalado Robusto (StandardScaler)")
    add_p(
        "Inmediatamente después de la imputación, los datos pasan por 'StandardScaler()', que resta la media y divide por la desviación "
        "estándar. Esto evita que variables con números grandes (como la presión en 690 hPa) dominen artificialmente a variables con números "
        "pequeños (como el viento en 1.5 m/s) en la regresión lineal."
    )

    add_h2("Paso 4: Ingeniería de Características (Feature Engineering)")
    add_p(
        "Los modelos no aprenden solo de los números crudos del termómetro; requieren variables derivadas que capturen la termodinámica del valle. "
        "En Colab se programaron los siguientes predictores matemáticos:"
    )
    add_p("1. Punto de Rocío (dewpoint_18): Calculado con la fórmula Magnus-Tetens a partir de temperatura y humedad. Indica la temperatura a la cual el aire se satura. Si el punto de rocío es bajo (-2 °C), el aire está extremadamente seco y la helada será negra (sin escarcha, la más dañina).", bold_prefix="• ")
    add_p("2. Depresión del Rocío (dew_spread_18): Diferencia directa entre la temperatura actual y el punto de rocío (TT_18 - dewpoint_18). Cuanto mayor sea esta brecha, más rápido se enfriará el suelo por radiación.", bold_prefix="• ")
    add_p("3. Caída Térmica Vespertina (delta_TT_15_18 y delta_TT_17_18): Mide la velocidad de enfriamiento al atardecer (Temperatura 18h - Temperatura 15h). Un desplome acelerado de 5 °C en 3 horas es el principal síntoma de helada inminente.", bold_prefix="• ")
    add_p("4. Descomposición Vectorial del Viento (wind_sin_18, wind_cos_18): Las direcciones en grados (0° a 360°) no se pueden meter crudas a una regresión (porque 359° y 1° son casi idénticos pero el número parece lejano). Se proyectaron en seno y coseno.", bold_prefix="• ")
    add_p("5. Ciclo Estacional Astronómico (doy_sin, doy_cos): Transforma el día del año (1 a 365) en coordenadas circulares. Así el modelo 'entiende' matemáticamente la cercanía del solsticio de invierno en junio sin necesidad de fechas en texto.", bold_prefix="• ")
    add_p("6. Inercia Térmica del Suelo (T_min_today y T_min_roll3): Registra la temperatura mínima de la madrugada anterior y el promedio móvil de los últimos 3 días. La tierra tiene memoria térmica: si viene enfriándose 3 días seguidos, helará casi con seguridad.", bold_prefix="• ")

    add_h2("Paso 5: Partición Cronológica Estricta (Train / Validation / Test)")
    add_p(
        "Se dividió el dataset en bloques de años completos: Entrenamiento (2021-2024), Validación y calibración de umbrales (2025), "
        "y Test ciego de evaluación final (2026). Jamás se aplicó un 'train_test_split' aleatorio, garantizando que el modelo sea probado "
        "en condiciones reales de anticipación temporal."
    )

    # ==========================================
    # 3. COMPETENCIA DE MODELOS
    # ==========================================
    add_h1("3. Competencia y Benchmark de Modelos Evaluados en Colab")
    add_p(
        "Antes de elegir la arquitectura definitiva, en Google Colab se puso a competir a los principales algoritmos de Machine Learning "
        "bajo las mismas condiciones de prueba. La siguiente tabla resume los resultados de la competencia:"
    )

    model_table = doc.add_table(rows=1, cols=5)
    model_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    model_table.autofit = False

    m_headers = ["Modelo Evaluado", "Tipo de Algoritmo", "Ventaja Principal", "Desventaja / Causa de Descarte", "Veredicto"]
    m_widths = [Inches(1.4), Inches(1.3), Inches(1.5), Inches(1.6), Inches(0.7)]

    m_hdr_cells = model_table.rows[0].cells
    for i, title_text in enumerate(m_headers):
        m_hdr_cells[i].text = title_text
        m_hdr_cells[i].width = m_widths[i]
        set_cell_background(m_hdr_cells[i], BG_HEADER)
        set_cell_margins(m_hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = m_hdr_cells[i].paragraphs[0]
        r = p.runs[0]
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(9.5)

    models_benchmark = [
        ("Regresión Lineal Simple (OLS)", "Paramétrico Lineal", "Fórmula exacta directa (Ecuación Normal). Muy rápido y 100% explicable.", "Asume que la atmósfera es una línea recta. No captura el frenado del enfriamiento por condensación ni ráfagas.", "Descartado como modelo único"),
        ("Regresión Ridge (L2)", "Lineal Regularizado", "Penaliza coeficientes gigantes. Gran estabilidad física y excelente generalización.", "Presenta error residual en noches con tormentas secas o inversiones térmicas abruptas.", "Elegido como Base Radiativa"),
        ("Regresión Lasso (L1)", "Lineal con Selección", "Apaga variables poco útiles poniendo sus coeficientes en cero.", "Apagaba variables que en verano no importan pero que en invierno son críticas (como el viento vespertino).", "Descartado"),
        ("Árbol de Decisión Único", "No lineal (Tree)", "Permite reglas visuales de decisión ('Si T<8 y HR<50 entoces...').", "Alto sobreajuste (Overfitting). Memorizó los datos de 2022 y falló estrepitosamente en 2025.", "Descartado"),
        ("Random Forest Regressor", "Ensamble (Bagging)", "Promedia 100 árboles de decisión. Modela no-linealidades complejas con gran precisión.", "Como regresor puro, tiende a predecir en 'mesetas' y le cuesta extrapolar heladas históricas récord.", "Elegido para Residuos"),
        ("XGBoost / LightGBM", "Ensamble (Boosting)", "Muy potente para clasificación binaria de umbrales de alerta.", "Mayor complejidad en inferencia web y sensibilidad a desbalance de clases de helada.", "Calibrador Auxiliar"),
        ("Ensamble Híbrido (Ridge + Random Forest)", "Residual Stacking en 2 Etapas", "Ridge marca el piso físico sin mesetas; Random Forest corrige la microturbulencia.", "Requiere mantener ambos modelos serializados en el microservicio.", "GANADOR DEFINITIVO")
    ]

    for row_idx, data in enumerate(models_benchmark):
        row_cells = model_table.add_row().cells
        bg_color = BG_ZEBRA if row_idx % 2 == 1 else "FFFFFF"
        if row_idx == len(models_benchmark) - 1:
            bg_color = BG_WARN
        for c_idx, val in enumerate(data):
            row_cells[c_idx].text = val
            row_cells[c_idx].width = m_widths[c_idx]
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(9.0)
                p.runs[0].font.name = "Calibri"
                if c_idx == 0:
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = PRIMARY
                if c_idx == 4 and row_idx == len(models_benchmark) - 1:
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = RGBColor(180, 83, 9)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_callout(
        "¿Por qué ganó el modelo híbrido? En física atmosférica, la pérdida de calor nocturna sigue una base radiativa constante (que la Regresión Ridge modela con elegancia). "
        "Sin embargo, las turbulencias de viento, el enfriamiento del suelo previo y la humedad generan fluctuaciones caóticas. "
        "El Random Forest aprende exclusivamente a predecir la diferencia (el residuo). Al sumar ambas salidas: T_pred = Ridge + RF_residuo, "
        "se logró un Error Absoluto Medio (MAE) inferior a 0.85 °C en el conjunto ciego de prueba de 2026.",
        "Fundamento Arquitectónico de la Elección: "
    )

    # ==========================================
    # 4. DICCIONARIO DE VARIABLES
    # ==========================================
    add_h1("4. Diccionario Completo de Variables de Entrada")
    add_p(
        "A continuación se presenta el diccionario consolidado de los datos procesados en la inferencia:"
    )

    var_table = doc.add_table(rows=1, cols=4)
    var_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    var_table.autofit = False

    headers = ["Variable", "Nombre Común", "Unidad", "¿Por qué es decisiva para la helada?"]
    col_widths = [Inches(1.2), Inches(1.5), Inches(0.8), Inches(3.0)]

    hdr_cells = var_table.rows[0].cells
    for i, title_text in enumerate(headers):
        hdr_cells[i].text = title_text
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], BG_HEADER)
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        r = p.runs[0]
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(9.5)

    variables_data = [
        ("TT_18", "Temperatura 6:00 PM", "°C", "Punto térmico de partida. Si el sol se oculta con menos de 8 °C, la probabilidad de helada antes del amanecer se triplica."),
        ("HR_18", "Humedad Relativa 6:00 PM", "%", "El vapor de agua actúa como escudo térmico. Con humedad menor al 50%, el calor se escapa directamente hacia el espacio exterior."),
        ("PP_18", "Presión Atmosférica 6:00 PM", "hPa", "En el valle (3,314 msnm) ronda los 687 hPa. Presiones altas indican cielos completamente despejados y ausencia de nubes."),
        ("FF_18", "Velocidad del Viento 6:00 PM", "m/s", "Calma absoluta (<1.5 m/s) permite que el aire frío y denso se pose en el fondo del valle. Viento moderado mezcla el aire y evita la helada."),
        ("DD_18", "Dirección del Viento 6:00 PM", "° azimut", "Identifica si las corrientes descienden desde las cordilleras secas y nevadas (oeste/noroeste), trayendo masas de aire polar al valle."),
        ("T_min_today", "Mínima de la Madrugada Previa", "°C", "Representa la memoria térmica del terreno. Si la noche anterior ya fue helada, el suelo está enfriado y volverá a helar con mayor facilidad."),
        ("dewpoint_18", "Punto de Rocío Estimado", "°C", "Calculado con Magnus-Tetens. Anticipa si el vapor condensará formando escarcha blanca o si ocurrirá la letal 'helada negra seca'."),
        ("dew_spread_18", "Depresión del Rocío", "°C", "Diferencia (TT_18 - dewpoint_18). Cuanto mayor sea esta brecha, más veloz será el descenso de temperatura durante la noche."),
        ("drop_from_max", "Caída desde la Máxima", "°C", "Diferencia entre la máxima del día y la temperatura de las 18:00 h. Mide la agresividad del choque térmico vespertino."),
        ("RR_afternoon", "Lluvia de la Tarde (12-18h)", "mm", "La humedad en el suelo almacena calor latente y mitiga la severidad del enfriamiento nocturno."),
        ("doy_sin / doy_cos", "Ciclo Estacional", "Coord. Cíclica", "Indica la fecha del año en función matemática senoidal para que el modelo identifique los meses más críticos (mayo a julio).")
    ]

    for row_idx, data in enumerate(variables_data):
        row_cells = var_table.add_row().cells
        bg_color = BG_ZEBRA if row_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(data):
            row_cells[c_idx].text = val
            row_cells[c_idx].width = col_widths[c_idx]
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(9.0)
                p.runs[0].font.name = "Calibri"
                if c_idx == 0:
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = SECONDARY

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ==========================================
    # 5. ARQUITECTURA DE SOFTWARE
    # ==========================================
    add_h1("5. Arquitectura de Software: Clean Architecture (.NET 8)")
    add_p(
        "Siguiendo estrictamente las especificaciones del solucionario del curso (Semanas 03 a 12), el backend se diseñó "
        "con una separación estricta en 4 capas concéntricas, aplicando el principio de Inversión de Dependencias (SOLID):"
    )
    add_p("• Capa Domain (MantaroFrostAlert.Domain): Entidad 'FrostPredictionRecord' que almacena todas las variables climáticas de corte, la predicción base (Ridge), la corrección residual (RF), la temperatura mínima predicha y el nivel de alerta sin dependencia de librerías externas.")
    add_p("• Capa Application (MantaroFrostAlert.Application): Orquesta los casos de uso del sistema. Define las interfaces 'IFrostPredictionService', 'IFrostPredictionRepository', 'IVpsMlClient' e 'IWeatherService', además de los DTOs de transferencia.")
    add_p("• Capa Infrastructure (MantaroFrostAlert.Infrastructure): Implementa el acceso a datos y servicios. Contiene 'AppDbContext' para PostgreSQL 16 con Entity Framework Core y los clientes HTTP tipados para comunicarse con el VPS y Open-Meteo.")
    add_p("• Capa API (MantaroFrostAlert.API): Punto de entrada RESTful con ASP.NET Core 8, controladores documentados con Swagger UI, inyección de dependencias y CORS permisivo.")

    # ==========================================
    # 6. DISEÑO DE INTERFAZ HUMANA (HCI)
    # ==========================================
    add_h1("6. Diseño de Interfaz Humana (HCI / UX)")
    add_p(
        "La interfaz web en React + Vite + Tailwind CSS se diseñó conforme a los más altos estándares de ergonomía cognitiva:"
    )
    add_p("• Donald Norman (Mapeo Natural): El formulario sigue la secuencia cronológica diurna del valle: Madrugada previa (00-07 h) → Tarde (12-18 h) → Corte vespertino (18:00 h) → Madrugada objetivo (D+1).")
    add_p("• Jakob Nielsen (Visibilidad de Estado): El encabezado muestra en tiempo real la salud y la latencia en milisegundos hacia el VPS ML, la base de datos y Open-Meteo mediante pulsos luminosos.")
    add_p("• Ben Shneiderman (Atajos y Cierre): Botones de prueba rápida en 1 clic para evaluadores (Helada Severa -1.5 °C, Alerta Amarilla +1.2 °C, Noche Templada +4.5 °C) y ficha de resolución contundente.")
    add_p("• Mapa Interactivo con Leaflet: En lugar de tablas áridas, un mapa interactivo georreferencia las 4 estaciones del corredor (Chupaca, Huancayo, Concepción, Jauja) con semáforos térmicos en tiempo real y selector de capas sin requerir ninguna API Key.")

    # ==========================================
    # 7. APIS Y DESPLIEGUE EN LA NUBE
    # ==========================================
    add_h1("7. APIs y Despliegue en la Nube: ¿Dónde está cada cosa?")
    add_p("Todos los componentes se encuentran en producción y plenamente comunicados:")
    add_p("1. Servidor VPS en Oracle Cloud (Ubuntu 24.04 ARM64):", bold_prefix="• ")
    add_p("   - Contenedor Docker 'heladas-junin-api' (Puerto 5080): Microservicio FastAPI en Python que ejecuta el modelo de Machine Learning serializado (mantaro_frost_model.joblib).")
    add_p("   - Contenedor Docker 'mantaro-frost-api' (Puerto 5090): Backend de Clean Architecture en C# .NET 8.")
    add_p("   - Contenedor Docker 'mantaro-frost-db' (Puerto 5432): Base de datos PostgreSQL 16 con persistencia de predicciones.")
    add_p("   - Cloudflare Zero Trust Tunnel: Expone el puerto 5080 de manera segura en https://heladas-api.astrazynk.pp.ua.")
    add_p("2. Frontend Global en Edge (Cloudflare Pages):", bold_prefix="• ")
    add_p("   - URL Pública en Producción: https://mantaro-frost-alert.pages.dev")
    add_p("   - Tiempos de carga menores a 800 ms y resiliencia con fallback automático al VPS si el backend local no está corriendo.")
    add_p("3. Repositorio Oficial en GitHub:", bold_prefix="• ")
    add_p("   - URL: https://github.com/Learning202413/Mantaro-Frost-Alert (Rama 'main') con CI/CD automático hacia Cloudflare Pages.")
    add_p("4. Telemetría Satelital Externa:", bold_prefix="• ")
    add_p("   - Open-Meteo API v1: Alimenta datos horarios en tiempo real para las 4 estaciones del valle sin necesidad de API Key.")

    # Save
    doc.save(output_path)
    print(f"Full documentation successfully created at: {output_path}")

if __name__ == "__main__":
    create_full_documentation()

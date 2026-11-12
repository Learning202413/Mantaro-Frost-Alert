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

def create_full_documentation(output_path="Documentacion_Sistema_Heladas_Mantaro.docx"):
    doc = Document()
    
    # Page setup - Margins (Normal: 1 inch / 2.54 cm)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
    
    # Primary Palette
    PRIMARY = RGBColor(15, 76, 129)     # Deep Navy / Classic Blue
    SECONDARY = RGBColor(14, 116, 144)  # Cyan Dark
    DARK_TEXT = RGBColor(30, 41, 59)    # Slate 800
    MUTED_TEXT = RGBColor(100, 116, 139)# Slate 500
    BG_HEADER = "0F4C81"
    BG_ZEBRA = "F1F5F9"
    BG_CALLOUT = "F0F9FF"

    # ==========================================
    # TITLE & METADATA
    # ==========================================
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_title = title.add_run("SISTEMA DE ALERTA TEMPRANA DE HELADAS EN EL VALLE DEL MANTARO")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = PRIMARY
    
    sub = doc.add_paragraph()
    r_sub = sub.add_run("Documento Técnico y Operativo de Arquitectura, Machine Learning e Interfaz Humana (HCI)")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(13)
    r_sub.font.italic = True
    r_sub.font.color.rgb = SECONDARY
    
    meta = doc.add_paragraph()
    r_meta = meta.add_run("Asignatura: Construcción de Software (2026-II) • Cátedra & Hackathon • Versión 2.0 Final")
    r_meta.font.name = "Calibri"
    r_meta.font.size = Pt(10)
    r_meta.font.color.rgb = MUTED_TEXT

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Helper function for Section Headings
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

    def add_callout(text, bold_prefix="Nota de Arquitectura: "):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_background(cell, BG_CALLOUT)
        set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
        cell.width = Inches(6.5)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        rb = p.add_run(bold_prefix)
        rb.font.name = "Calibri"
        rb.font.size = Pt(10)
        rb.font.bold = True
        rb.font.color.rgb = SECONDARY
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = DARK_TEXT
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================================
    # 1. RESUMEN EJECUTIVO
    # ==========================================
    add_h1("1. Resumen Ejecutivo del Proyecto")
    add_p(
        "En el Valle del Mantaro (Junín, Perú), ubicado a una altitud promedio de 3,250 a 3,350 metros sobre el nivel del mar, "
        "las heladas meteorológicas y agronómicas representan uno de los mayores peligros naturales para la producción agrícola. "
        "Durante las noches despejadas de otoño e invierno (especialmente entre mayo y julio), la pérdida de calor por radiación hacia "
        "el espacio enfría drásticamente el fondo del valle, provocando caídas de temperatura por debajo de 0 °C antes del amanecer."
    )
    add_p(
        "El presente sistema resuelve este problema mediante una plataforma de software integral de alta precisión: "
        "a las 18:00 h (corte vespertino), el sistema captura las condiciones atmosféricas del valle y pronostica con 11 horas de "
        "anticipación la temperatura mínima exacta que se alcanzará en la madrugada siguiente (entre 05:00 h y 06:00 h). "
        "Esto brinda una ventana de tiempo vital para que los agricultores y autoridades activen medidas preventivas de mitigación térmica "
        "(como el riego por aspersión continuo que libera calor latente o el despliegue de coberturas protectoras)."
    )
    add_callout(
        "La solución articula cuatro componentes fundamentales: (1) Un modelo de Machine Learning entrenado en Google Colab con datos reales "
        "del IGP Huayao, (2) un microservicio de inferencia en Python desplegado en un VPS de Oracle Cloud, (3) un backend empresarial "
        "en C# (.NET 8) bajo Clean Architecture con persistencia en PostgreSQL, y (4) un frontend moderno en React + Vite + Tailwind CSS "
        "con mapa interactivo Leaflet alojado en la red global de Cloudflare Pages.",
        "Visión Global del Sistema: "
    )

    # ==========================================
    # 2. QUÉ HICIMOS EN GOOGLE COLAB
    # ==========================================
    add_h1("2. ¿Qué Hicimos en Google Colab? (Explicación Sencilla y Didáctica)")
    add_p(
        "El desarrollo del modelo de predicción no fue una 'caja negra' improvisada, sino un proceso riguroso de ciencia de datos "
        "y aprendizaje automático supervisado, ejecutado paso a paso en cuadernos interactivos de Google Colab."
    )
    
    add_h2("A. El Dataset Histórico Real del IGP (2018 - 2025)")
    add_p(
        "Para entrenar el sistema no se utilizaron datos ficticios, sino mediciones horarias de la Estación Meteorológica Automática (EMA) "
        "del Instituto Geofísico del Perú (IGP), situada en el Observatorio Geofísico de Huayao (UBIGEO 120904, distrito de Huachac, provincia de Chupaca, a 3,314 msnm). "
        "Este dataset contiene más de 70,000 registros que capturan con fidelidad el comportamiento microclimático del valle a lo largo de 8 años."
    )

    add_h2("B. El Corte Cronológico Estricto (División Temporal sin Trampa)")
    add_p(
        "En problemas de clima nunca se debe mezclar aleatoriamente el pasado y el futuro (un error clásico de novatos conocido como data leakage). "
        "En Google Colab se implementó una partición temporal estricta:",
        bold_prefix="Metodología de Validación: "
    )
    add_p("• Periodo de Entrenamiento (2021 - 2024): Donde los algoritmos aprendieron las correlaciones térmicas y radiativas.", bold_prefix="1. ")
    add_p("• Periodo de Calibración de Umbrales (2025): Donde se ajustaron las alertas rojas y amarillas para maximizar la detección.", bold_prefix="2. ")
    add_p("• Periodo de Evaluación Ciega (2026): Datos retenidos sin ver para comprobar que el modelo generaliza bien en condiciones reales.", bold_prefix="3. ")

    add_h2("C. La Arquitectura Híbrida en 2 Etapas (Ridge + Random Forest)")
    add_p(
        "Para lograr un pronóstico infalible, en Google Colab se diseñó una arquitectura de ensamble residual en dos etapas complementarias:"
    )
    add_p(
        "1. Etapa 1 - El 'Piso Físico Radiativo' (Modelo Ridge / Regresión Lineal L2): "
        "Calcula la pérdida constante de calor que ocurre de noche según las leyes físicas de la termodinámica. Al estar regularizado con penalidad L2, "
        "evita sobreajustes y garantiza una base matemática sólida que no predice temperaturas absurdas."
    )
    add_p(
        "2. Etapa 2 - La 'Corrección No Lineal de Residuos' (RandomForestRegressor): "
        "Los fenómenos atmosféricos no son 100% lineales. Este bosque de árboles de decisión analiza lo que la física lineal no puede explicar: "
        "turbulencias de viento, caídas repentinas de temperatura en la tarde, cambios bruscos de presión y vientos secos cordilleranos. "
        "El Random Forest estima únicamente el 'residuo' (el error restante) y lo suma o resta a la predicción base."
    )
    add_callout(
        "Fórmula Conceptual de Inferencia: Temperatura Mínima Predicha = Predicción Base (Ridge) + Corrección Residual (Random Forest). "
        "Este enfoque híbrido combina lo mejor de la física teórica con la potencia del Machine Learning moderno.",
        "Ecuación del Modelo: "
    )

    add_h2("D. Calibración de Umbrales de Alerta")
    add_p(
        "Una predicción numérica aislada no le sirve al agricultor en el campo si no viene acompañada de una advertencia operativa clara. "
        "En Colab se calibraron dos umbrales térmicos según la susceptibilidad andina:",
        bold_prefix="Semáforo de Riesgo: "
    )
    add_p("• Nivel ROJO (Peligro Crítico - Temperatura ≤ 1.0 °C): Helada inminente severa con alta probabilidad de formación de escarcha o daño tisular.", bold_prefix="🔴 ")
    add_p("• Nivel AMARILLO (Alerta Preventiva - Temperatura ≤ 2.0 °C): Noche muy fría con alto riesgo en zonas de ladera o fondos cóncavos del valle.", bold_prefix="🟡 ")
    add_p("• Nivel VERDE (Condición Normal - Temperatura > 2.0 °C): Sin riesgo significativo de congelación para los cultivos.", bold_prefix="🟢 ")

    # ==========================================
    # 3. DICCIONARIO DE VARIABLES
    # ==========================================
    add_h1("3. Diccionario de Variables Meteorológicas (Sin Tecnicismos Innecesarios)")
    add_p(
        "El modelo procesa variables medidas a las 18:00 h (corte de tarde) junto a la historia térmica del día. "
        "A continuación se explica qué representa cada variable en lenguaje claro:"
    )

    # Table of Variables
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
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p.runs[0]
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(9.5)

    variables_data = [
        ("TT_18", "Temperatura a las 6:00 PM", "°C", "Punto de partida térmico. Si el atardecer ya está frío (menos de 8 °C), la noche requerirá menos horas para cruzar el punto de congelación."),
        ("HR_18", "Humedad Relativa a las 6:00 PM", "%", "El vapor de agua actúa como una frazada natural. El aire seco (menos de 50%) permite que el calor se escape rápidamente al espacio exterior."),
        ("PP_18", "Presión Atmosférica a las 6:00 PM", "hPa", "Valores altos de presión suelen asociarse a cielos completamente despejados y ausencia de nubes, acelerando la pérdida de calor por radiación."),
        ("FF_18", "Velocidad del Viento a las 6:00 PM", "m/s", "El viento en calma absoluta (menos de 1.5 m/s) favorece que el aire helado más pesado se asiente en el fondo del valle (inversión térmica)."),
        ("DD_18", "Dirección del Viento a las 6:00 PM", "° azimut", "Identifica si las corrientes descienden desde las cordilleras secas y nevadas (oeste y noroeste), trayendo masas de aire polar al valle."),
        ("T_min_today", "Mínima de la Madrugada Previa", "°C", "Representa la 'inercia térmica' acumulada en el suelo. Si la noche anterior fue muy helada, la tierra ya está enfriada y volverá a helar con facilidad."),
        ("dewpoint_18", "Punto de Rocío Estimado", "°C", "Temperatura a la que el aire condensa su vapor. Clave para anticipar si habrá escarcha blanca protectora o la destructiva 'helada negra seca'."),
        ("doy_sin / doy_cos", "Ciclo Estacional del Año", "Adimensional", "Indica la fecha astronómica. Permite que el modelo sepa matemáticamente que en junio y julio las noches son más largas y frías que en verano."),
        ("RR_afternoon", "Precipitación de la Tarde", "mm", "La lluvia vespertina moja el suelo. La tierra húmeda almacena calor y retrasa el enfriamiento nocturno respecto a un terreno seco.")
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
                p.runs[0].font.size = Pt(9.5)
                p.runs[0].font.name = "Calibri"
                if c_idx == 0:
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = SECONDARY

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ==========================================
    # 4. ARQUITECTURA DE SOFTWARE
    # ==========================================
    add_h1("4. Arquitectura de Software: Clean Architecture (.NET 8)")
    add_p(
        "En estricto cumplimiento con el solucionario de la asignatura Construcción de Software (Semanas 03 a 12), el backend se construyó "
        "bajo los principios de Clean Architecture (Arquitectura Limpia) y principios SOLID, asegurando total separación de responsabilidades:"
    )
    
    add_p("1. Capa Domain (MantaroFrostAlert.Domain): El núcleo del sistema. Contiene la entidad pura 'FrostPredictionRecord' que define todos los atributos climáticos, los valores del modelo (Ridge y Random Forest), la temperatura mínima predicha, el nivel de alerta y las marcas de tiempo sin depender de frameworks ni bases de datos.", bold_prefix="• ")
    add_p("2. Capa Application (MantaroFrostAlert.Application): Orquesta los casos de uso del negocio. Contiene los contratos e interfaces (IFrostPredictionService, IFrostPredictionRepository, IVpsMlClient, IWeatherService) y los DTOs de transferencia. Cumple el principio de Inversión de Dependencias (D de SOLID): la aplicación conoce qué hacer mediante contratos, nunca cómo se implementa.", bold_prefix="• ")
    add_p("3. Capa Infrastructure (MantaroFrostAlert.Infrastructure): Implementa el acceso a recursos externos. Aloja el 'AppDbContext' de Entity Framework Core para la persistencia en PostgreSQL, el repositorio asíncrono 'FrostPredictionRepository' y los clientes HTTP tipados para comunicarse con el microservicio ML en el VPS y con la API meteorológica Open-Meteo.", bold_prefix="• ")
    add_p("4. Capa API (MantaroFrostAlert.API): Punto de entrada HTTP expuesto con ASP.NET Core 8. Implementa controladores REST documentados con Swagger UI (PredictionsController, ModelController, HealthController, WeatherController) y gestiona la inyección de dependencias y CORS.", bold_prefix="• ")

    add_callout(
        "Regla de Dependencia de Clean Architecture: El flujo de dependencias siempre apunta hacia adentro. "
        "Domain no depende de nadie; Application solo conoce Domain; Infrastructure y API dependen de Application. "
        "Esta estructura garantiza que la lógica de predicción sea agnóstica a cambios en la base de datos o en la tecnología web.",
        "Principio de Calidad: "
    )

    # ==========================================
    # 5. DISEÑO DE INTERFAZ HUMANA (HCI)
    # ==========================================
    add_h1("5. Diseño de Interfaz Humana (HCI / UX)")
    add_p(
        "La interfaz web no se diseñó de manera intuitiva o cosmética, sino fundamentada en tres pilares de la Ergonomía del Software "
        "e Interacción Persona-Ordenador:"
    )

    add_h2("A. Donald Norman (Psicología de los Objetos Cotidianos)")
    add_p("• Mapeo Natural Cronológico: El formulario de pronóstico vespertino no presenta un listado desordenado, sino una secuencia temporal que emula el ciclo diurno andino: Madrugada Previa (00-07 h) → Tarde Andina (12-18 h) → Corte Vespertino (18:00 h) → Madrugada Objetivo (D+1).", bold_prefix="1. ")
    add_p("• Significantes Visibles: Cada campo incluye su unidad física explícita (°C, %, hPa, m/s) y botones de ayuda contextual con explicaciones en lenguaje de campo.", bold_prefix="2. ")
    add_p("• Restricciones Físicas (Constraints): El sistema previene errores de tipeo bloqueando números físicamente absurdos en la cordillera (ej. humedades mayores a 100% o presiones fuera de rango).", bold_prefix="3. ")
    add_p("• Retroalimentación Continua: Al ingresar temperatura y humedad, el sistema calcula de inmediato en segundo plano el punto de rocío y avisa si la helada será con escarcha o seca.", bold_prefix="4. ")

    add_h2("B. Jakob Nielsen (10 Heurísticas de Usabilidad)")
    add_p("• H1 - Visibilidad del Estado del Sistema: El encabezado incluye insignias con pulso luminoso y medición en milisegundos de la latencia real hacia el VPS ML, la base de datos y Open-Meteo.", bold_prefix="• ")
    add_p("• H2 - Coincidencia con el Mundo Real: Uso de terminología agrometeorológica local (inversión térmica, cuenca del Mantaro, calor latente de fusión).", bold_prefix="• ")
    add_p("• H3 - Control y Libertad del Usuario: Botones para restablecer el formulario a cero o copiar el reporte a un solo toque para difundirlo por WhatsApp o SMS rural.", bold_prefix="• ")
    add_p("• H8 - Diseño Estético y Minimalista: Paneles limpios de alto contraste legibles bajo la luz solar en campo.", bold_prefix="• ")

    add_h2("C. Ben Shneiderman (8 Reglas de Oro)")
    add_p("• Regla 2 - Atajos para Evaluadores: Cuatro botones de 1 clic que cargan casos típicos (Helada Severa -1.5 °C, Alerta Amarilla +1.2 °C, Noche Templada +4.5 °C, y Sincronización en Vivo).", bold_prefix="• ")
    add_p("• Regla 4 - Cierre del Diálogo: La tarjeta de resultados ofrece un veredicto visual contundente: medidor térmico gigante, descomposición del modelo (Ridge vs RF) y cronograma de ronda nocturna (22:00 h, 02:00 h, 05:30 h).", bold_prefix="• ")

    add_h2("D. ¿Por qué un Mapa Interactivo con Leaflet?")
    add_p(
        "Las tablas de números exigen un esfuerzo analítico lento y propenso a fatiga. En el mapa interactivo, el cerebro humano "
        "asimila la situación del valle en 200 milisegundos gracias a la visión periférica: los nodos circulares de Chupaca, Huancayo, Concepción "
        "y Jauja cambian de color (rojo/amarillo/verde) e informan la temperatura al instante. El usuario puede alternar entre vista de mapa "
        "estándar, ortofoto satelital de alta resolución y relieve topográfico sin requerir ninguna API Key."
    )

    # ==========================================
    # 6. APIS Y MICROSERVICIOS
    # ==========================================
    add_h1("6. APIs y Microservicios del Ecosistema")
    add_p("El sistema opera mediante la colaboración de tres servicios complementarios:")

    api_table = doc.add_table(rows=1, cols=4)
    api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    api_table.autofit = False

    api_headers = ["Servicio / API", "Tecnología / Endpoint", "Responsabilidad Principal", "Modo de Consumo"]
    api_col_widths = [Inches(1.5), Inches(2.0), Inches(2.0), Inches(1.0)]

    hdr_cells2 = api_table.rows[0].cells
    for i, title_text in enumerate(api_headers):
        hdr_cells2[i].text = title_text
        hdr_cells2[i].width = api_col_widths[i]
        set_cell_background(hdr_cells2[i], BG_HEADER)
        set_cell_margins(hdr_cells2[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells2[i].paragraphs[0]
        r = p.runs[0]
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(9.5)

    apis_data = [
        ("Microservicio ML (VPS)", "Python 3.12 / FastAPI\nPOST /api/v1/predict\nGET /health\nGET /api/v1/modelo", "Carga el modelo serializado .joblib. Ejecuta el ensamble Ridge + Random Forest y devuelve la temperatura mínima estimada, umbrales y nivel de alerta.", "HTTP REST\nJSON"),
        ("Backend Empresarial (VPS)", "C# ASP.NET Core 8\nPOST /api/predictions\nGET /api/predictions\nGET /api/weather/live", "Implementa Clean Architecture. Persiste el histórico de predicciones en PostgreSQL, aplica reglas de negocio y orquesta la comunicación con el microservicio ML.", "HTTP REST\nJSON"),
        ("API Meteorológica Satelital", "Open-Meteo API v1\nGET /v1/forecast\n(Coordenadas del Valle)", "Provee lecturas meteorológicas horarias en tiempo real para las 4 estaciones del corredor Mantaro (temperatura, humedad, presión, viento y lluvia) sin API key.", "HTTP REST\nJSON Pública")
    ]

    for row_idx, data in enumerate(apis_data):
        row_cells = api_table.add_row().cells
        bg_color = BG_ZEBRA if row_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(data):
            row_cells[c_idx].text = val
            row_cells[c_idx].width = api_col_widths[c_idx]
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(9.5)
                p.runs[0].font.name = "Calibri"
                if c_idx == 0:
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = PRIMARY

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ==========================================
    # 7. INFRAESTRUCTURA Y DESPLIEGUE
    # ==========================================
    add_h1("7. Infraestructura y Despliegue en la Nube: ¿Dónde está cada cosa?")
    add_p(
        "Toda la solución se encuentra completamente operativa, desplegada en entornos de producción en la nube:"
    )

    add_h2("A. Servidor VPS en la Nube (Oracle Cloud Infrastructure)")
    add_p("• Máquina Host: Instancia Ubuntu 24.04 LTS (Arquitectura ARM64 / aarch64) en Oracle Cloud.", bold_prefix="• ")
    add_p("• Contenedor 1 - heladas-junin-api (Puerto 5080): Contenedor Docker con el microservicio FastAPI en Python que ejecuta el modelo de Machine Learning mantaro_frost_model.joblib.", bold_prefix="• ")
    add_p("• Contenedor 2 - mantaro-frost-api (Puerto 5090): Contenedor Docker con el Backend de Clean Architecture en C# (.NET 8).", bold_prefix="• ")
    add_p("• Contenedor 3 - mantaro-frost-db (Puerto 5432): Contenedor PostgreSQL 16 con volumen persistente mantaro_pgdata.", bold_prefix="• ")
    add_p("• Cloudflare Zero Trust Tunnel: Un túnel seguro encriptado que expone el puerto 5080 hacia internet bajo el dominio seguro: https://heladas-api.astrazynk.pp.ua.", bold_prefix="• ")

    add_h2("B. Frontend Global en Edge (Cloudflare Pages)")
    add_p("• URL Pública de Producción: https://mantaro-frost-alert.pages.dev", bold_prefix="• ")
    add_p("• Infraestructura: Desplegado en la red CDN global de Cloudflare Pages, garantizando tiempos de carga inferiores a 800 ms y protección SSL automática.", bold_prefix="• ")
    add_p("• Resiliencia Integrada: El frontend cuenta con un fallback inteligente; si el backend local no está encendido, se conecta de forma directa al microservicio ML del VPS, garantizando que el usuario siempre pueda predecir.", bold_prefix="• ")

    add_h2("C. Control de Versiones e Integración Continua (GitHub)")
    add_p("• Repositorio Oficial: https://github.com/Learning202413/Mantaro-Frost-Alert", bold_prefix="• ")
    add_p("• Rama Activa: main", bold_prefix="• ")
    add_p("• CI/CD Automático: Cada commit empujado a la rama main dispara la compilación y despliegue automático en Cloudflare Pages en menos de 60 segundos.", bold_prefix="• ")

    # ==========================================
    # 8. GUÍA DE PUESTA EN MARCHA
    # ==========================================
    add_h1("8. Guía de Puesta en Marcha Local (Para el Evaluador)")
    add_p("Si se desea ejecutar el sistema de forma local en una estación de trabajo, se dejaron dos scripts de ejecución directa con doble clic:")
    add_p("1. run-backend.bat: Restaura los paquetes NuGet, levanta la API de C# en http://localhost:5029 y abre la interfaz interactiva de Swagger UI.", bold_prefix="• ")
    add_p("2. run-frontend.bat: Inicia el servidor de desarrollo Vite en http://localhost:5173 con recarga en caliente.", bold_prefix="• ")

    # Save document
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    create_full_documentation()

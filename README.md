DIEUNAH ver m27.20150303-10:46am
UNIVERSIDAD NACIONAL AUTÓNOMA DE HONDURAS
DIRECCIÓN DE INNOVACIÓN EDUCATIVA
CREADO POR: CLAUDIO ANIBAL BARAHONA FLORES
NOVIEMBRE 2014
Script para detectar las actividades de una clase e incorporrarlo directamente en el html de las clases Totalmente en Línea

Requisitos para funcionamiento de este plugin:
 1. jquery
 2. plugin para jquery colorbox
 3. plugin para jquery blockIU

Requisitos de la clase moodle leida:
 1. Ninguna actividad debe estar en la sección 0 de moodle
 2. Deben estar presentes en la sección 0 de moodle los foros: Novedades, Presentación, Cafetería, Consultas Académicas. Con el titulo usando estas mismas palabras.
 3. Toda Sección que se desea que se interprete como Unidad debe tener la palabra Unidad seguida sel número de unidad en el título de la misma
 4. Toda Sección que se desea que se interprete como Examen debe tener la palabra Examen seguida del número de Examen en el título de la misma
 5. Toda Sección que no contenga las reglas 4 y 5 serán ignoradas
 6. Antes de toda actividad debe haber una etiqueta con la palabra Tema, seguido del número de Tema
 7. Si llega haber actividades sin especificar de que tema son mediante etiqueta colocada antes, entonces la actividad será considerada como perteneciente a un tema 0 "t0"
 8. Si una actividad está marcada como oculta esta será tomada como el script como si no existiera
 9. plugin para jquery colorbox
 10. plugin para jquery blockIU

 Script para Moodle 2.7

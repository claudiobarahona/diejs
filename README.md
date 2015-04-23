# diejs

**die.js** permite obtener información con respecto a la esctructura de una clase en Moodle 2.7 y poder elaborar un calendario resumido con todas las actividades a nivel de html

<http://die.unah.edu.hn>

DIEUNAH ver m27.20150303-10:46am<br>
UNIVERSIDAD NACIONAL AUTÓNOMA DE HONDURAS<br>
DIRECCIÓN DE INNOVACIÓN EDUCATIVA<br>
CREADO POR: CLAUDIO ANIBAL BARAHONA FLORES<br>
NOVIEMBRE 2014<br>
## Requisitos
 1. jquery, <https://jquery.com/>
 2. plugin para jquery colorbox <http://www.jacklmoore.com/colorbox/>
 3. plugin para jquery blockIU <http://malsup.com/jquery/block/>

## Utilización
```js
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <script src="//cdn.jsdelivr.net/jquery/latest/jquery.min.js"></script>
            <script src="//cdn.jsdelivr.net/colorbox/latest/jquery.colorbox-min.js"></script>
            <script src="//cdn.jsdelivr.net/jquery.blockui/latest/jquery.blockUI.min.js"></script>
            <script>
                var revisarLecturaLista = setInterval(function () {RevisarLectura()}, 500);
                $(document).ready(function() {
                    dieunah.bloquear_pantalla();
                });
                function RevisarLectura() {
                   if(parent.dieunah.CalendarizacionLista()){
                       $("#calendario").html(parent.dieunah.GenerarCalendario());
                       clearInterval(revisarLecturaLista);
                   };
                };
            </script>
        </head>
        <body>
            <div id="titulo"><h1>Calendario</h1></div>
            <div id="calendario"><table align="center"><tr><td align="center">Cargando...</td></tr></table></div>
        </body>
    </html>
```

## Notas Adicionales

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

## Copyright

© [die.unah.edu.hn][], 2015

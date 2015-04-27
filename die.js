////DIEUNAH ver m27.20150426-04:29pm
//UNIVERSIDAD NACIONAL AUTÓNOMA DE HONDURAS
//DIRECCIÓN DE INNOVACIÓN EDUCATIVA
//CREADO POR: CLAUDIO ANIBAL BARAHONA FLORES 
//NOVIEMBRE 2014
//Script para detectar las actividades de una clase e incorporrarlo directamente en el html de las clases Totalmente en Línea
//
//Requisitos para funcionamiento de este plugin:
//	1. jquery
//	2. plugin para jquery colorbox
//	3. plugin para jquery blockIU
//
//Requisitos de la clase moodle leida:
//	1. Ninguna actividad debe estar en la sección 0 de moodle
//	2. Deben estar presentes en la sección 0 de moodle los foros: Novedades, Presentación, Cafetería, Consultas Académicas. Con el titulo usando estas mismas palabras.
//	3. Toda Sección que se desea que se interprete como Unidad debe tener la palabra Unidad seguida sel número de unidad en el título de la misma
//	4. Toda Sección que se desea que se interprete como Examen debe tener la palabra Examen seguida del número de Examen en el título de la misma
//	5. Toda Sección que no contenga las reglas 4 y 5 serán ignoradas
//	6. Antes de toda actividad debe haber una etiqueta con la palabra Tema, seguido del número de Tema
//	7. Si llega haber actividades sin especificar de que tema son mediante etiqueta colocada antes, entonces la actividad será considerada como perteneciente a un tema 0 "t0"
//	8. Si una actividad está marcada como oculta esta será tomada como el script como si no existiera
//	9. plugin para jquery colorbox
//	10. plugin para jquery blockIU
//
// JavaScript Document
// Script para Moodle 1.9

//Para compatibilidad de String.trim con ie8
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g,"");
};
if (typeof dieunah == 'undefined')
var dieunah = new function() {
    this.nUnidades=0;
    this.nExamenes=0;
    this.urlRoot="";
    //this.urlRoot="http://localhost/moodle";
    this.lista=[];
    this.dias=["Dom","Lun", "Mar","Mié","Jue","Vie","Sab"];
    this.meses=["Ene", "Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    this.yaProcesado=false;
    this.yaCalendarizado=[true,true];
    this.puedeEditar=false;
    this.bEditando=false;
    this.sesskey=null;
    this.TiposActividadesDisponibles=[];
    this.idCurso=(window.location.pathname.match(/\/\d+\//)[0]).match(/\d+/)[0];//Primero detecta si hay un numero entre plecas /n/ despues sacar solo el numero que esta entre las plecas n
    var parent=this;

    //******************* Actividad por id de actividad ********************
    //Devuelve un array con los datos de las actividades de toda la clase {id: titulo: url:}
    //Esta función debe ser llamada antes que todas las otras
    //Ej: lista_actividades()
    this.bloquear_pantalla=function(msg){
        if(msg==undefined) msg="Por favor espere...";
        $.blockUI({ css: { 
            border: 'none', 
            padding: '15px', 
            backgroundColor: '#000', 
            '-webkit-border-radius': '10px', 
            '-moz-border-radius': '10px', 
            opacity: .5, 
            color: '#fff' 
        },message: msg });
    };
    this.lista_actividades = function () {
	var preSubURL=String(window.location.href.match(/.*file.php/));
	parent.urlRoot=preSubURL.substring(0,preSubURL.length-9);
        $.get(parent.urlRoot+"/course/view.php?id="+parent.idCurso+"&parametroDEGT=quitar",function(data,status){
            var RegExpPatt=new RegExp("id=([0-9]+)");
            var RegExpTipomod = /\/mod\/(\w+)\//i; 
            if(status=="error") 
                    alert ("Problema con la conexión de internet (error: 1)");
            else if(status=="timeout") 
                    alert ("Problema con la conexión de internet (error: 2)");
            else if(status=="parsererror")
                    alert ("Problema con el formato de conexión de internet (error: 3)");
            resultado=data;
            /*Participantes */parent.lista.push({ id:'u0t0a0_participantes',modID:0,modTipo:0, titulo: 'Participantes', url:parent.urlRoot+"/user/index.php?id="+parent.idCurso});
            /*Calificaciones*/parent.lista.push({ id:'u0t0a0_calificaciones',modID:0,modTipo:0, titulo: 'Calificaciones', url:parent.urlRoot+"/grade/report/index.php?id="+parent.idCurso});
            /*Novedades     */parent.lista.push({ id:'u0t0a0_novedades',modID:0,modTipo:0, titulo: $('li[id=section-0] a:contains("Novedades")',data).text(), url:$('li[id=section-0] a:contains("Novedades")',data).attr('href')});
            /*Consultas     */parent.lista.push({ id:'u0t0a0_consultas',modID:0,modTipo:0, titulo: $('li[id=section-0] a:contains("Consulta")',data).text(), url:$('li[id=section-0] a:contains("Consulta")',data).attr('href')});
            /*Presentación  */parent.lista.push({ id:'u0t0a0_presentacion',modID:0,modTipo:0, titulo: $('li[id=section-0] a:contains("Presenta")',data).text(), url:$('li[id=section-0] a:contains("Presenta")',data).attr('href')});
            /*Cafetería     */parent.lista.push({ id:'u0t0a0_cafeteria',modID:0,modTipo:0, titulo: $('li[id=section-0] a:contains("Cafe")',data).text(), url:$('li[id=section-0] a:contains("Cafe")',data).attr('href')});
            /*Salir         */parent.lista.push({ id:'u0t0a0_salir',modID:0,modTipo:0, titulo: 'Salir', url:parent.urlRoot+'/my/'});
            $('li[id^=section-]',data).each(function(){//Buscando las posibles unidades
                if($(this).attr('id')=='section-0') return true;//Evitando la sección 0, esa ya le sacamos el jugo arriba
                var strUnidad=$('.summary',this).text().trim().toLowerCase().match(/unidad\s*\d+/); //Bucando un tit de secc con la plabra unidad n ("unidad" seguido de "n")
                if(strUnidad===null){//Revisando si no se encontro unidad n
                    var strUnidad=$('.summary',this).text().trim().toLowerCase().match(/unidad/); //Si no hay unidad con "n", entonces la nueva unidad será la unidad anterior+1
                    if(strUnidad===null){//Si no se encontro la palabra "unidad" con o sin "n" pues no tomar en cuenta esta sección y seguir con la siguiente
                            //return true;
                    } else parent.nUnidades++;
                    //nUnidad=parent.nUnidades;
                }else{
                    nUnidad=parseInt(strUnidad[0].match(/\d+/));//Si hay titulo de seccion con "Unidad n" entonces la unidad actual será esa "n"
                    parent.nUnidades=nUnidad;
                }
                var nTemaActual=0;
                var nActividadActual=1;
                $('li',this).each(function(){//Buscando los elementos dentro del la sección (Unidad)
                    if($('.contentwithoutlink ',this).length == 0 && $('a.dimmed',this).length==0 ){//Incluir los elem solo si son elementos de actividad o recurso (no etiquetas) //REGLA 8
                        var key="u"+parent.nUnidades+"t"+nTemaActual+"a"+nActividadActual;							
                        if($('a:contains("_noact")',this).length==0){//Evitar que una actividad especifica visible no sea tomada en cuenta
                            var tipoMod=RegExpTipomod.exec($('a',this).attr('href'));
                            if($('a:contains("Examen")',this).length==0 && $('a:contains("Recupera")',this).length==0 && $('a:contains("Repos")',this).length==0){
                                nActividadActual++;
                                parent.lista.push({ id:key, modID : RegExpPatt.exec($('a',this).attr('href'))[1],modTipo:tipoMod[1], titulo: $(this).text().trim(), url:$('a',this).attr('href'),puntos:0,fInicio:0,fFinal:0});
                            }else{
                                parent.nExamenes++;
                                parent.lista.push({ id:'u0t0a0_e'+parent.nExamenes, modID : RegExpPatt.exec($('a',this).attr('href'))[1],modTipo:tipoMod[1], titulo: $(this).text().trim(), url:$('a',this).attr('href'),puntos:0,fInicio:0,fFinal:0});
                            }
                        }
                    }else if($('.contentwithoutlink ',this).length > 0 && $('a.dimmed',this).length==0 ){
                        nTemaActual=parseInt($(this).text().match(/\d+/)[0]);
                        nActividadActual=1;
                    }
                });
            });
            setTimeout($.unblockUI, 100);
            parent.yaProcesado=true;
            parent.Calendarizar();
            $('body').append('<div id="hotpt85469" style="background-color:#000;width:10px; height:10px; display:block; position:absolute; bottom:0px; left:0px"></div>');
            $('#hotpt85469').click(function(e) {
                if(e.shiftKey && e.ctrlKey && e.altKey) {
                    $.colorbox({html:parent.HTML_lista_actividades()});
                }
            });
        },"html");
		return parent.lista;
    };
    this.Calendarizar=function(){
        parent.yaCalendarizado=[true,true];
        //**********************************************************************************************
        //                          OBTENIENDO FECHAS DE CALENDARIO
        //Usando el módulo de reporte de fechas (editdates) para obtener las fechas de entrega de todo 
        //*******************************************************************************************
        $.get(parent.urlRoot+"/report/editdates/index.php?id="+parent.idCurso+"&activitytype=assign",function(data,status){
            //Revisando el primer tipo de actividad normalmente (assign, Tareas)
            //Revisando que otros tipos de actividades hay que revisar
            parent.sesskey=$("input[name='sesskey']",data).attr("value");
            parent.ObtenerFechas(data);
            var tiposActividades = [];
            //Buscando los tipos de actividades que detectó el reporte editdates
            $('form[id=activitytypeform] div select option',data).each(function(){
                if(!($(this).attr("selected")=="selected")) tiposActividades.push($(this).attr("value"));
            });
            //Analizando actividad por actividad
            for(i=0;i<tiposActividades.length;i++){
                if(!(tiposActividades[i]=="resource" || tiposActividades[i]=="label" || tiposActividades[i]=="url")){//resource, label y url No deben ser procesados
                    parent.yaCalendarizado.push(true);
                    $.get(parent.urlRoot+"/report/editdates/index.php?id="+parent.idCurso+"&activitytype="+tiposActividades[i],function(data,status){
                        parent.ObtenerFechas(data);
                        parent.yaCalendarizado.pop();
                    },"html");
                }
            }
            parent.TiposActividadesDisponibles=tiposActividades;
            parent.TiposActividadesDisponibles.splice(parent.TiposActividadesDisponibles.indexOf(""),1);
            parent.yaCalendarizado.pop();

            },"html");
        //**********************************************************************************************
        //                               FIN FECHAS DE CALENDARIO
        //**********************************************************************************************
        //**********************************************************************************************
        //                          OBTENIENDO Calificaciones de Actividades
        //*******************************************************************************************
        $.get(parent.urlRoot+"/grade/report/user/index.php?id="+parent.idCurso,function(data,status){
            var re = /(\d?\.?\d+$)/; 
            var reID=new RegExp("id=([0-9]+)");
            var m;
            $("th[class*='item']",data).each(function(){
                var idMOD=reID.exec($("a",this).attr("href"));
                $("td[headers$='"+$(this).attr("id")+" range']",data).each(function(){
                    var stri=$(this).text();
                    m = re.exec(stri);
                    var idEnLista=parent.actividad_por_modID(idMOD[1]);
                    if (idEnLista!=false) parent.lista[idEnLista]["puntos"]=m[1];
                });
            });
            parent.yaCalendarizado.pop();
        },"html");
        //**********************************************************************************************
        //                                 FIN CALIFICACIONES
        //**********************************************************************************************
    }
    this.CalendarizacionLista=function(){
    	if(parent.yaCalendarizado.length==0)
            return true;
    	else
            return false;
    };
    this.ObtenerFechas=function(data){
    	var RegExpPattNum=new RegExp("_([0-9]+)_");
    	var RegExpPattTipo=new RegExp("_(allowsubmissionsfromdate|duedate|cutoffdate|timeopen|timeclose|assesstimestart|assesstimefinish|submissionstart|submissionend|available|deadline|assessmentstart|assessmentend)");
    	//COMENZANDO CON EL PRIMER CASO: Si el reporte de fechas esta en MODO EDICIÓN
        
	    $('div[id^="fitem_id_date_mod_"]',data).each(function(){//Buscando las actividades correspondientes
                parent.puedeEditar=true;
	    	var strModuloActual=String($(this).attr("id")).substring(6);
                var strTipoActualActividad="";
                strTipoActualActividad=RegExpPattTipo.exec(strModuloActual)[1]==null?false:RegExpPattTipo.exec(strModuloActual)[1];

                //Si la fecha esta deshabilitada entonces nos saltamos al seguiente ciclo del each. El foro no usa habilitacio o deshabilitacion de fecha
                if($('input[id="'+strModuloActual+'_enabled"]',this).attr("checked")!=="checked" && !(strTipoActualActividad=="assesstimestart" || strTipoActualActividad=="assesstimefinish")){
                    return true;
                }

                var strFecha=$('select[id="'+strModuloActual+'_month"] option[selected=selected]',this).attr("value");
                strFecha=strFecha+"/"+$('select[id="'+strModuloActual+'_day"] option[selected=selected]',this).attr("value");
                strFecha=strFecha+"/"+$('select[id="'+strModuloActual+'_year"] option[selected=selected]',this).attr("value");
                strFecha=strFecha+" "+$('select[id="'+strModuloActual+'_hour"] option[selected=selected]',this).attr("value");
                strFecha=strFecha+":"+$('select[id="'+strModuloActual+'_minute"] option[selected=selected]',this).attr("value");
                var dFecha=new Date(strFecha);
                var idEnLista=parent.actividad_por_modID(RegExpPattNum.exec(strModuloActual)[1]);

                if(idEnLista && strTipoActualActividad)
                    switch(strTipoActualActividad){
                        case "allowsubmissionsfromdate"://caso de tareas
                            parent.lista[idEnLista]["fInicio"]=dFecha;
                            break;
                        case "timeopen"://caso de cuestionarios automáticos
                            parent.lista[idEnLista]["fInicio"]=dFecha;
                            break;
                        case "assesstimestart"://caso de foros
                            parent.lista[idEnLista]["fInicio"]=dFecha;
                            break;
                        case "duedate"://caso de tareas
                            parent.lista[idEnLista]["fFinal"]=dFecha;
                            break;
                        case "timeclose"://caso de cuestionarios automáticos
                            parent.lista[idEnLista]["fFinal"]=dFecha;
                            break;
                        case "assesstimefinish"://caso foros
                            parent.lista[idEnLista]["fFinal"]=dFecha;
                            break;
                        case "cutoffdate":
                            //No Implementado aún, habria que agregar en el array parent.lista un campo mas despues de fFinal
                            break;
                    }
            });
	  //COMENZANDO CON EL SEGUNDO CASO: Si el reporte de fechas esta en modo SOLO LECTURA
	    if(!parent.puedeEditar){
                var re = /id_date_mod_(\d+)_(\w+)_(day|month|year|hour|minute)">[^<]+<\/label>(\d+|\w+)/gi; 
                var re_enabled = /checked="checked"/i 
                $('div[class^=felement]',data).each(function(){
                    var enabled=re_enabled.exec($(this).html());
                    var fecha=new Date();
                    var idMOD=0;
                    var strTipoAcción="";
                    while ((m = re.exec($(this).html())) != null) {
                        if (m.index === re.lastIndex) {
                            re.lastIndex++;
                        }
                        idMOD=m[1];
                        strTipoAcción=m[2];
                        if(!enabled && !(strTipoAcción=="assesstimestart" || strTipoAcción=="assesstimefinish"))//Si la casilla de habilitado no esta marcada, entonces esta fecha no porcesarla, hay que ingnorarla
                            return true;
                        switch(m[3]){
                            case "day":
                                fecha.setDate(m[4]);
                                break;
                            case "month":
                                fecha.setMonth(parent.strMes_nMes(m[4]));
                                break;
                            case "year":
                                fecha.setFullYear(m[4]);
                                break;
                            case "hour":
                                fecha.setHours(m[4]);
                                break;
                            case "minute":
                                fecha.setMinutes(m[4]);
                                break;
                        }
                    }
                    
                    var idEnLista=parent.actividad_por_modID(idMOD);
                    if(idEnLista && idMOD>0){
                        switch(strTipoAcción){
                            case "allowsubmissionsfromdate"://caso de tareas
                                parent.lista[idEnLista]["fInicio"]=fecha;
                                break;
                            case "timeopen"://caso de cuestionarios automáticos
                                parent.lista[idEnLista]["fInicio"]=fecha;
                                break;
                            case "assesstimestart"://caso de foros
                                parent.lista[idEnLista]["fInicio"]=fecha;
                                break;
                            case "duedate"://caso de tareas
                                parent.lista[idEnLista]["fFinal"]=fecha;
                                break;
                            case "timeclose"://caso de cuestionarios automáticos
                                parent.lista[idEnLista]["fFinal"]=fecha;
                                break;
                            case "assesstimefinish"://caso foros
                                parent.lista[idEnLista]["fFinal"]=fecha;
                                break;
                            case "cutoffdate":
                                //No Implementado aún, habria que agregar en el array parent.lista un campo mas despues de fFinal
                                break;
                        }
                    }
                   
                });
            }
	    return true;
    };
    this.strMes_nMes=function(strMes){
    	var meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre","ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic","january","february","march","april","may","june","july","august","september","october","november","december"];
		return meses.indexOf(String(strMes).toLowerCase()) % 12; 
    };
    //******************* HTML de la Lista de Actividades ********************
	//Devuelve una tabla en HTML 
	//Ej: HTML_lista_actividades()
	 this.HTML_lista_actividades = function () {
             var strHTML='';
             strHTML+="<table border='1' align='center' cellpadding='5' cellspacing='0' class='tablactividades' width='800px'>";
             strHTML+="<tr><td>id</td><td>modID</td><td>tipo Mod</td><td>Unidad</td><td>Tema</td><td>Actividad</td><td>Titulo</td><td>Url</td><td>Puntos</td><td>Inicio</td><td>Fin</td></tr>";
             for(i=0;i<parent.lista.length;i++)
             {			
                strHTML+="<tr><td>"+parent.lista[i].id+"</td><td>"+parent.lista[i].modID+"</td><td>"+parent.lista[i].modTipo+"</td><td>"+parent.lista[i].id.match(/u\d+/)+"</td><td>"+parent.lista[i].id.match(/t\d+/)+"</td><td>"+parent.lista[i].id.match(/a\d+/)+"</td><td>"+parent.lista[i].titulo+"</td><td>"+parent.lista[i].url+"</td><td>"+parent.lista[i].puntos+"</td><td>"+parent.lista[i].fInicio+"</td><td>"+parent.lista[i].fFinal+"</td></tr>";
             }
             strHTML+="</table>";
             return strHTML;
	 };
	//******************* Índice del array de Actividad por id de Módulo ********************
        //Devuelve un número de elemento segun el id de módulo {id: titulo: url:}
        //Ej: actividad_por_modID(30)
        this.actividad_por_modID = function(modID){
            for(i=0;i<parent.lista.length;i++)
            {
                 if(parent.lista[i]["modID"]==modID)
                    return i;
            }
            return false;
        };
	//******************* Actividad por id de actividad ********************
	//Devuelve un array de 1 elemento con los datos de la actividad {id: titulo: url:}
	//Ej: actividad_por_id('u1t1a1')
	this.actividad_por_id = function(id){
            for(i=0;i<parent.lista.length;i++)
            {
                 if(parent.lista[i]["id"]==id)
                        return parent.lista[i];
            }
            return false;
	};
	//******************* Actividad por id de actividad ********************
	//Devuelve string con  el html <a> enlazando a la actividad solicitada
	//Ej: HTML_actividad_por_id('u1t1a1')
	this.HTML_actividad_por_id = function(id){
		var actividad=this.actividad_por_id(id);
		var sHTML="";
		if(actividad==false){
                    sHTML="ERROR: "+id+" actividad no presente";
		}else{
                    sHTML="<a href='#' onClick='parent.$.colorbox({href:\""+actividad.url+"\",width:\"95%\", height:\"95%\", iframe:true}); return false;'>"+actividad.titulo+"</a>";
		}
		return sHTML;
	};
	//******************* Actividades por unidad y tema ********************
	//Devuelve un array de n elementos del tema y unidad solicitados con los datos de la actividad [{id: titulo: url:},{id: titulo: url:},...]
	//Ej: actividades_de_tema(1,1)
	this.actividades_de_tema = function(nUnidad,nTema){
            var sublista=[];
            for(i=0;i<parent.lista.length;i++)
            {			
                 var semi_id="u"+nUnidad+"t"+nTema;
                 var id_real=parent.lista[i]["id"];
                 if(id_real.substr(0,semi_id.length)==semi_id)
                        sublista.push(parent.lista[i]);
            }
            if(sublista.length==0)
                return false;
            else
                return sublista;
	};
	this.LimpiarActividadMoodle = function(){
            //Moodle 27 normal
            $( ".cboxIframe" ).contents().find("#page-header").css("display", "none" );
            $( ".cboxIframe" ).contents().find(".navbar-inner").css("display", "none" );
            $( ".cboxIframe" ).contents().find("#block-region-side-pre").css("display", "none" );
            $( ".cboxIframe" ).contents().find("#block-region-side-post").css("display", "none" );
            $( ".cboxIframe" ).contents().find("#region-main").css("width", "100%" );
            $( ".cboxIframe" ).contents().find("#page-footer").css("display", "none" );

            //Moodle 27 CampusVirtual UNAH
            $( ".cboxIframe" ).contents().find("footer").css("display", "none" );
            $( ".cboxIframe" ).contents().find(".content-header").css("display", "none" );
            $( ".cboxIframe" ).contents().find(".navbar navbar-default navbar-fixed-top").css("display", "none" );
            $( ".cboxIframe" ).contents().find("#main-container").css("margin-left", "0px" );
            $( ".cboxIframe" ).contents().find("#sidebar").css("display", "none" );
            $( ".cboxIframe" ).contents().find(".col-md-4").css("display", "none" );
            $( ".cboxIframe" ).contents().find(".breadcrumb breadcrumb-top").css("display", "none" );
		
	}
	//******************* Actividades por unidad y tema ********************
	//Devuelve un html enlazando a las actividades del tema y unidad solicitados
	//Ej: HTML_actividades_de_tema(1,1)
	this.HTML_actividades_de_tema = function(nUnidad,nTema,arrParametro){
            var actividades=this.actividades_de_tema(nUnidad,nTema);
            if(typeof arrParametro == "undefined"){
                arrParametro=[];
            }
            var html="";
            html="<table border='0' align='center' cellpadding='10' cellspacing='10' class='tablactividades'>";
            if(actividades==false)
                html+="<tr><td>No hay actividades en este tema.</td></tr>";
            else{
                //html+="<table border='0' align='center' cellpadding='10' cellspacing='10' class='tablactividades'>";
                for(i=0;i<actividades.length;i++){
                    html+="<tr><td><a href='#' onClick='parent.$.colorbox({href:\""+actividades[i].url+"\",width:\"95%\", height:\"95%\", iframe:true,onComplete:function(){ parent.$( \".cboxIframe\" ).load(function(){parent.dieunah.LimpiarActividadMoodle(\".cboxIframe\")});}});return false;'>";
                    html+=actividades[i].titulo;
                    html+="</a></td></tr>";
                }
            }
            if(arrParametro.length>0)
                for(j=0;j<arrParametro.length;j++){
                    html+="<tr><td><a href='#' onClick='parent.$.colorbox({href:\"../unidad_"+nUnidad+"/t"+nTema+"_autoevaluacion"+(j+1)+".html\",width:\"95%\", height:\"95%\", iframe:true}); return false;'>";
                    html+=arrParametro[j];
                    html+="</a></td></tr>";
                }
            html+="</table>";
            return html;
	};
	
	
	//******************* Generar Calendario HTML ********************
	//Ej: GenerarCalendario()
	
        this.GenerarCalendario = function(){
            var strHTML="";
            var nUnidadActual=0;
            var nUnidadQueSigue=0;
            var nUnidadQueSeProceso=0;
            var strHTMLdeUnidad1eraLinea="";
            var strHTMLdeUnidad="";
            var nTemaItemActual=0;
            var nFilasDeUnidad=0;
            var nPersistenciaTema=0;
            var nTemaAnterior=0;
            var arrTemasPersistentes = [];
            var arrTemasPersistentesN = [];
            strHTML='<table class="tabla_calendario" border="0" cellpadding="10px" cellspacing="0" align="center"><tr style="text-align:center" class="titulo"><td>Unidad</td><td>Tema</td><td>Actividad</td><td>Valor</td><td>Fecha</td></tr>';
            for(i=0;i<this.lista.length;i++){
                //Buscar Unidad Actual
                nUnidadActual=parseInt(String(this.lista[i].id.match(/u\d+/)).substring(1));
                if(i<this.lista.length-1) nUnidadQueSigue=parseInt(String(this.lista[i+1].id.match(/u\d+/)).substring(1)); else nUnidadQueSigue=nUnidadActual+1;
                nTemaItemActual=parseInt(String(this.lista[i].id.match(/t\d+/)).substring(1));
                var strFechaInicio="";
                var strFechaFinal="";
                var bFechaInicioVisible=false;
                var bFechaFinalVisible=false;
                
                //Procesando la fecha de INICIO
                if(this.lista[i].fInicio===0 || this.lista[i].fInicio===undefined)
                    strFechaInicio=(parent.bEditando?"<div class='rotuloini des'>Disponible desde:</div><input class='inicio_oculto' id='fecha_ini_"+i+"'></input>":"")+parent.FechaCadena(this.lista[i].fInicio);
                else{
                    bFechaInicioVisible=true;
                    strFechaInicio=(parent.bEditando?"<input tipomod='"+this.lista[i].modTipo+"' class='inicio_visible' id='fecha_ini_"+i+"' value='"+parent.FechaCadena(this.lista[i].fInicio,true)+"'></input>":"<div class='rotuloini'>Disponible desde:</div>"+parent.FechaCadena(this.lista[i].fInicio));
                }

                //Procesando la fecha de FINAL
                if(this.lista[i].fFinal===0 || this.lista[i].fFinal===undefined)
                    strFechaFinal=(parent.bEditando?"<div class='rotulofin des'>Fecha máxima:</div><input class='final_oculto' id='fecha_fin_"+i+"'></input>":"")+parent.FechaCadena(this.lista[i].fFinal);
                else{
                    bFechaFinalVisible=true;
                    strFechaFinal=(parent.bEditando?"<input tipomod='"+this.lista[i].modTipo+"' class='final_visible' id='fecha_fin_"+i+"' value='"+parent.FechaCadena(this.lista[i].fFinal,true)+"'></input>":"<div class='rotulofin'>Fecha máxima:</div>"+parent.FechaCadena(this.lista[i].fFinal));
                }
                
                //Creando la Tablita con los datos de fecha inicial y final de una actividad
                var strFechasEnTabla="<table width='100%' class='calen' id='id"+this.lista[i].modID+"'><tr><td>"+strFechaInicio+"</td><td width='10px'>"+(parent.bEditando?'<img style="display:'+(bFechaInicioVisible?"inline":"none")+'" class="del_ini" id="ini_id_'+i+'" src="js/delete16.png"/>':"")+"</td></tr><td>"+strFechaFinal+"</td><td>"+(parent.bEditando?'<img style="display:'+(bFechaFinalVisible?"inline":"none")+'" class="del_fin" id="fin_id_'+i+'" src="js/delete16.png"/>':"")+"</td></tr></table>";
                
                if(nUnidadQueSeProceso < nUnidadActual) 
                    nFilasDeUnidad=0;
                if(nUnidadActual == 0){
                    var nExamenActual=parseInt(String(this.lista[i].id.match(/e\d+/)).substring(1));
                    if(nExamenActual > 0) strHTML+="<tr class='examen'><td colspan='3' class='exa_tit'><a href='"+this.lista[i].url+"'>"+this.lista[i].titulo+"</a></td><td align='center'>"+(this.lista[i].puntos==0?"No se califica":this.lista[i].puntos)+"</td><td style='white-space:nowrap;'>"+strFechasEnTabla+"</td></tr>";
                    continue;
                }else{
                    nFilasDeUnidad++;
                    if(nFilasDeUnidad==1){ //Si es la primera fila de unidad
                        //Este if corrige el problema de spanrow faltante cuando se cambia de tema
                        if(nPersistenciaTema>1){
                            arrTemasPersistentes.push("u"+nUnidadQueSeProceso+"t"+nTemaAnterior);
                            arrTemasPersistentesN.push(nPersistenciaTema);
                        }
                        nPersistenciaTema=1;
                        nTemaAnterior=nTemaItemActual;
                        strHTMLdeUnidad1eraLinea="Unidad "+nUnidadActual+"</td><td"+((nUnidadActual % 2 == 1)?" class='tema_impar' ":" class='tema_par' ")+" id='u"+nUnidadActual+"t"+nTemaItemActual+"'>Tema "+nTemaItemActual+"</td><td> <a href='"+this.lista[i].url+"'>"+this.lista[i].titulo+"</a><br>"+(parent.bEditando&&this.lista[i].modTipo=="forum"?"<span style='color:#FF0000'>Es obligatorio en los Foros colocar fecha de inicio y fecha final</span>":"")+"</td><td align='center'>"+(this.lista[i].puntos==0?"No se califica":this.lista[i].puntos)+"</td><td style='white-space:nowrap;'>"+strFechasEnTabla+"</td></tr>";
                    }else{//Las filas de una unidad que siguen 
                            if(nTemaAnterior==nTemaItemActual){
                                strHTMLdeUnidad+="<tr"+((nUnidadActual % 2 == 1)?" class='impar' ":" class='par' ")+"><td> <a href='"+this.lista[i].url+"'>"+this.lista[i].titulo+"</a><br>"+(parent.bEditando&&this.lista[i].modTipo=="forum"?"<span style='color:#FF0000'>Es obligatorio en los Foros colocar fecha de inicio y fecha final</span>":"")+"</td><td align='center'>"+(this.lista[i].puntos==0?"No se califica":this.lista[i].puntos)+"</td><td style='white-space:nowrap;'>"+strFechasEnTabla+"</td></tr>";
                                nPersistenciaTema++;
                            }else{
                                if(nPersistenciaTema>=2){ 
                                    arrTemasPersistentes.push("u"+nUnidadActual+"t"+nTemaAnterior);
                                    arrTemasPersistentesN.push(nPersistenciaTema);
                                }
                                strHTMLdeUnidad+="<tr"+((nUnidadActual % 2 == 1)?" class='impar' ":" class='par' ")+"><td"+((nUnidadActual % 2 == 1)?" class='tema_impar' ":" class='tema_par' ")+" id='u"+nUnidadActual+"t"+nTemaItemActual+"' rowspan='1'>Tema "+nTemaItemActual+"</td><td> <a href='"+this.lista[i].url+"'>"+this.lista[i].titulo+"</a><br>"+(parent.bEditando&&this.lista[i].modTipo=="forum"?"<span style='color:#FF0000'>Es obligatorio en los Foros colocar fecha de inicio y fecha final</span>":"")+"</td><td align='center' style='white-space:nowrap;'>"+this.lista[i].puntos+"</td><td>"+strFechasEnTabla+"</td></tr>";
                                nPersistenciaTema=1;
                            }
                            if(i==parent.lista.length-1 && nPersistenciaTema>=2){
                                arrTemasPersistentes.push("u"+nUnidadActual+"t"+nTemaAnterior);
                                arrTemasPersistentesN.push(nPersistenciaTema);
                            }

                            nTemaAnterior=nTemaItemActual;
                    }
                    nUnidadQueSeProceso=nUnidadActual;
                }
                if(nUnidadQueSigue!=nUnidadActual) {
                        strHTML+="<tr"+((nUnidadActual % 2 == 1)?" class='impar' ":" class='par' ")+"><td "+((nUnidadActual % 2 == 1)?" class='unidad_impar' ":" class='unidad_par' ")+" rowspan='"+nFilasDeUnidad+"'>"+strHTMLdeUnidad1eraLinea+strHTMLdeUnidad;
                        strHTMLdeUnidad="";
                }
             };
            strHTML+='</table>';
            for (var i=0; i < arrTemasPersistentes.length; i++){
                    strHTML=strHTML.replace("id='"+arrTemasPersistentes[i]+"'","rowspan='"+arrTemasPersistentesN[i]+"'");
            }
            return strHTML;
	};
	this.FechaCadena=function(fecha,simplificado){
            if(simplificado==undefined)
                simplificado = false;
            else
                simplificado = true;
            var strResultado="";
            if(fecha && !simplificado) 
                strResultado="<span class='dia'>"+parent.dias[fecha.getDay()]+"</span>, "+fecha.getDate()+" "+parent.meses[fecha.getMonth()]+" <span class='agno'>"+fecha.getFullYear()+"</span> - <span class='hora'>"+(fecha.getHours()==0?"00":fecha.getHours())+":"+(fecha.getMinutes()==0?"00":fecha.getMinutes())+"</span> "; 
            else if(fecha && simplificado)
                strResultado=fecha.getDate()+"/"+(fecha.getMonth()+1)+"/"+fecha.getFullYear()+" "+(fecha.getHours()==0?"00":fecha.getHours())+":"+(fecha.getMinutes()==0?"00":fecha.getMinutes()); 
            else 
                strResultado="";
            
            return strResultado;
	};
	//LA SIGUIENTE LINEA FUNCIONA COMO UN CONSTRUCTOR, Se ejecuta cuando se llama al objeto dieunah
	this.lista_actividades();
};

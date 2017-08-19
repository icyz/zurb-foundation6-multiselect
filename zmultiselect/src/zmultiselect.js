"use strict";
(function($) {

    var defaultLang = {
        'Check all': 'Check all',
        'Uncheck all': 'Uncheck all',
        'Search': 'Search...',
        'Selected': 'Selected',
        'of': 'of',
        'showed': 'Showed',
    }

    //toggle for click on zselect, close for click elsewhere, nothing for click on .zselect *
    $(document).on('click', function(e){    
        var id = false;
        if(e.target.tagName == 'SPAN'){ id = $(e.target).parent().attr('id'); }
        if(e.target.tagName == 'DIV'){  id = $(e.target).attr('id'); }

        var container = $(".zselect ul");

        if ( container.parent().is(e.target) || container.prev().is(e.target) || ( container.is(':visible') && !container.parent().is(e.target) ) && ( container.has(e.target).length === 0 )  ) {
            if(!id) container.hide(); //when user click out
            else {
                $(".zselect#"+id+" ul").toggle();
                setTimeout(function(){ //jquery focus bug workaround
                    $(".zselect#"+id+" ul li.zmsfilter input").focus();
                }, 1);
            }
        }

    });

    

    //escape key for close all zselect
    $(window).on('keydown', function(e){
        e = e || window.event;
        if (e.keyCode === 27) {
            $("li.zmsfilter input").val('').keyup(); //clean filter
            $(".zselect ul").hide();
        }
    });



    //click on label toggle input
    $(document).on('click', '.zselect li, .zselect li input:checkbox', function(e){
        var zbeforeChangeEvent = $.Event('zbefore_change', {'target': e.target});
        $(this).trigger(zbeforeChangeEvent);
        if(zbeforeChangeEvent.result === false) {
            e.preventDefault();
            if($(this).prop("tagName") == 'LI'){
                $(this).children().attr("checked", false);
                $(this).children().trigger('change');
            }                    
            else{
                $(this).attr("checked", false); // hack to keep placeholder text correct
                $(this).trigger('change');
            }
            return;
        }
        $(this).trigger('change');
        if($(e.target).prop("tagName") !== "INPUT"){
            $("input:checkbox[disabled!='disabled']",this).prop('checked', function( i, val ) { return !val; }).trigger('change');
        }  
    });
    

    //select all and deselect all 
    $(document).on('click','.selectall,.deselectall', function(){
        var parent = $(this).parent().find("input:checkbox[disabled!='disabled']:visible");
        parent.prop('checked', (($(this).hasClass('selectall')) ? true : false) );
        parent.eq('0').change();
    });

    //optgroup
    $(document).on('click','.optgroup', function(){ 
        var zbeforeOptgroupEvent = $.Event('zbeforeOptgroupEvent');
        $(this).trigger(zbeforeOptgroupEvent);
        if(zbeforeOptgroupEvent.result === false) {
            return;
        }
        
        var checked = false;
        $.each( $(this).parent().find(".optgroup_"+$(this).attr('data-optgroup')+" li input:checkbox[disabled!='disabled']"), function(){
            if($(this).prop('checked') == false){
                checked = true;
                return false;    
            }
        });
        
        $(this).parent().find(".optgroup_"+$(this).attr('data-optgroup')+" li input:checkbox[disabled!='disabled']").prop('checked', checked).change();
    });


    //when resize window + init
    function onResize(reflow){ 
        $.each( $(".zselect"), function(k,v){
            $(v).find("ul").attr('style', 'width:'+ $(v).outerWidth() +'px!important;' );
        });

    }
    $( window ).resize(function() {
        onResize();
    });

    
    function refreshPlaceholder(rel, placeholder, selectedText){ 
        var checked = $("div#"+rel+" ul li input:checked").length;
        if(checked > 0) {
            $(".zselect#"+rel+" span.zmshead").text(selectedText[0]+" "+checked+" "+selectedText[1]+" "+ $("div#"+rel+" ul li input:checkbox").length);
        }
        else {
            $(".zselect#"+rel+" span.zmshead").html( (placeholder === undefined) ? '&nbsp;' : placeholder );
        }
    }




var methods = {
    init : function(options) {
        /*
        options = options || {

            //locale: 'it-IT',

            //REPLACE WITH CUSTOM TEXT:
            //selectAllText: ['Check All', 'Uncheck All'],
            //selectedText: ['Selected', 'of'],
            //filterPlaceholder: 'What are your searching for?',
            //filterResultText: "Showed",
            //filterPlaceholder: 'MyFilter...',

            //get: "params",
            //live: "#live",
            //placeholder: "My pretty zurb multiselect",

        }
        */
        var id, checked, dataZ, disabled="", disabledClass="";
        var optgroup = [];
        var optgroupSize, optgroupId = 0;
        var optgroupName = false;
        var optgroupMembers = 0;
        var locale;

        if(options.locale) {
            locale = __zms_i18n[options.locale];
        }
        if(typeof(locale) !== "object"){
            locale = defaultLang;
        }
        options.selectedText = options.selectedText || [locale['Selected'], locale['of']];
        options.filter = options.filter || true;
        options.filterResult = options.filterResult || true;
        options.selectAll = options.selectAll || true;


            $.each( $(this),function(k,v){
        
            id=Math.random().toString(36).substr(2, 9);
            $(v).hide().attr('rel',id).addClass('zms');
            $(v).parent().append("<div id='"+id+"' class='zselect'><span class='zmshead'></span><ul></ul></div>");
            
            if(options.selectAll){
                var sAllText    = locale['Check all'];
                var desAllText  = locale['Uncheck all'];
                if(options.selectAllText !== undefined){
                    sAllText=options.selectAllText[0];
                    desAllText=options.selectAllText[1];
                }

                var desAllFA = "", sAllFA="";
                $('#'+id+' ul').append("<li class='selectall'>"+sAllFA+sAllText+"</li>");
                $('#'+id+' ul').append("<li class='deselectall'>"+desAllFA+desAllText+"</li>");
            }

            _live = "";
            $.each(v, function(j,z){
                var appendTo;
                if( $(z).parent().attr("label") !== undefined && optgroup.indexOf($(z).parent().attr("label"))===-1 ){
                    optgroupSize = $(z).parent().find('option').length;
                    optgroupMembers += optgroupSize;
                    optgroupName = $(z).parent().attr("label");  
                    
                    $('#'+id+' ul').append("<li class='optgroup' data-optgroup='"+optgroupId+"'>"+$(z).parent().attr("label")+"</li>");
                    $('#'+id+' ul').append($("<div>").addClass('optgroup_'+optgroupId));
                    optgroup.push($(z).parent().attr("label"));
                }
                //console.log( $(z).attr('value') + " " + $(z).text() + " " + $(z).is('[data-selected]') + " " + $(z).is(':selected'));
                //console.log(id);
                //console.log( '#'+id+' ul' );

                checked = "";
                if( $(z).is('[data-selected]') ){
                    checked = "checked='checked'";
                    _live += $(z).val()+",";
                }

                checked = ( $(z).is('[data-selected]') ) ? "checked='checked'" : "";
                dataZ = ( $(z).data("z") !== undefined ) ? 'data-z="' + $(z).data("z") + '"' : "";
                
                if( $(z).is('[data-disabled]') ){
                    disabled = "disabled='disabled'";
                    disabledClass = "class='disabled'";
                }
                else{
                    disabled = disabledClass = "";
                }
                
                if( optgroupName === false ) appendTo = '#'+id+' ul';
                else                         appendTo = '#'+id+' ul div.optgroup_'+optgroupId;
                    
                    
                $(appendTo).append("<li "+disabledClass+"><input value='"+$(z).val()+"' type='checkbox' "+checked+" "+disabled+" "+dataZ+" /><span style=\"width:100%;display:table-cell;\">"+$(z).text()+"</span></li>");
                
                if(optgroupMembers === j+1) {
                    optgroupSize = 0;
                    optgroupId ++;
                    optgroupName = false;
                }
                
                
            });

            if(options.live !== undefined){
                $(options.live).val(_live.substring(0, _live.length - 1));
            }
            refreshPlaceholder(id,options.placeholder,options.selectedText);
        });
        
        if(options.filter === true){
            //defaults
            if (options.filterResult === undefined) options.filterResult = true;
            if (options.filterResultText === undefined) options.filterResultText = locale['showed'];
            var fplaholder = (options.filterPlaceholder !== undefined) ? options.filterPlaceholder : locale['Search'];

            var rel = this.attr('rel');
            $("div#"+rel+" ul").prepend('<li class="zmsfilter"><input type="text" placeholder="'+fplaholder+'" /></li>');

            if(options.filterResult === true)
                $("div#"+rel+" ul").append('<li class="filterResult"></li>');
            
            $("div#"+rel+" ul li.zmsfilter input").keyup(function(){
                var value=$(this).val().toLowerCase();
                var show=0,tot=$("div#"+rel+" ul li input:checkbox").length;
                $("div#"+rel+" ul li input:checkbox").filter( function(i,v) {
                      //console.log($(v).val());
                      //console.log($(v).parent().text());
                      if( $(v).val().toLowerCase().indexOf(value) === -1 && $(v).parent().text().toLowerCase().indexOf(value) === -1 ){//and text() check...
                           $(v).parent().hide();
                      }
                      else {
                           $(v).parent().show();
                           show++;
                      }

                });

                if(options.filterResult === true) {
                    $("div#" + rel + " ul li.filterResult").text(options.filterResultText + ' ' + show + ' / ' + tot);
                }

            });
        }//end filter
        
        
        if(options.live !== undefined){
            var rel = this.attr('rel');
            $(".zselect#"+rel).on('change','input:checkbox',function(e){
                $(options.live).val( methods.getValue($("select[rel='"+rel+"']")) );
            });
        }//end live
        
        
        if(options.get !== undefined){  //console.log(options.get);
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            var need = false; 
            for (var i=0; i< vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == options.get) {
                    need = pair[1].replace(new RegExp(',', 'g'), '%2C').split('%2C');
                  
                }
            } 
            if(need){
                var rel = this.attr('rel');
                var _live = "";
                for(var i=0; i<need.length; i++){
                    $(".zselect#"+rel+" ul li input:checkbox[value='"+decodeURI(need[i])+"']").prop('checked',true);
                    _live += need[i]+",";
                }
                //refresh live value
                if(options.live !== undefined){
                    $(options.live).val(_live.substring(0, _live.length - 1));
                }
                refreshPlaceholder(rel,options.placeholder,options.selectedText);
            }
        }

        
        // Updates original select after checkbox update
        $(".zselect#"+rel).on('change', 'input:checkbox', function() {
            var container = $(this).closest('.zselect');
            var rel = container.attr('id');
            refreshPlaceholder(rel, options.placeholder, options.selectedText);
            var select = $('select[rel='+rel+']');
            
            $.each(container.find('input:checkbox'), function(k, v) {
                if($(v).val() !== undefined){
                    select.find("option[value='"+$(v).val()+"']").prop("selected", $(v).prop('checked'));
                }
            });
            
            //select.trigger('change');
            //console.timeEnd('A1');
        });
        

        onResize();


    },


    _refreshLive: function(rel){
        $("div#"+rel+" ul li input:checkbox:last").trigger('change');
    },
    
    getValue : function(selector) { 
       if(selector === undefined) selector = this;
       //console.log(selector);
       //console.log(options);
       var value = [];
       var rel   = $(selector).attr('rel');
       $.each( $("div#"+rel+" ul li input"), function(k,v){
          if( $(v).val() !== undefined ){
               if( $(v).prop('checked') )
               value.push($(v).val());
          }
       });
       $("div#"+$(this).attr('rel')+" ul li input:checkbox:last").trigger('change');
       methods._refreshLive($(this).attr('rel'));
       return value;
    },



        
    open : function( ) {
        $("div#"+$(this).attr('rel')+" ul").show();
    },
    close : function( ) {
        $("div#"+$(this).attr('rel')+" ul").hide();
    },
    
            
    disable : function(val, state){
        $("div#"+$(this).attr('rel')+" ul li input:checkbox[value='"+val+"']").prop("disabled", state);
    },

    disableAll: function(state){
        $("div#"+$(this).attr('rel')+" ul li input:checkbox").prop("disabled", ((state !== undefined) ? state : true));
    },

    /*
    enableAll: function(){
        methods.disableAll(true); //need pass rel
    },
    */

    set : function (val, checked){
        $("div#"+$(this).attr('rel')+" ul li input:checkbox[value='"+val+"']").prop('checked', checked).trigger('change');
    },

    checkAll : function() {
        $("div#"+$(this).attr('rel')+" ul li input:checkbox").prop('checked', true);
        methods._refreshLive($(this).attr('rel'));
    },
    uncheckAll : function() {
        $("div#"+$(this).attr('rel')+" ul li input:checkbox").prop('checked', false);
        methods._refreshLive($(this).attr('rel'));
    },
    destroy : function (val){
        $("div#"+$(this).attr('rel')+" ul li input:checkbox[value='"+val+"']").parent().remove();
        methods._refreshLive($(this).attr('rel'));
    },
    reflow : function(){
        onResize(true);
        $(".zselect#"+$(this).attr('id')+" input:first").trigger('change'); //serve per rimettere il placeholder ed il campo live
    },
    
    add : function(option, pos){
        var position = pos || 'append';
        var checked='', disabled='', disabledClass='';
        
        if(option.checked)  {checked=' checked="checked" ';}
        if(option.disabled) {disabled=' disabled="disabled" '; disabledClass=' class="disabled" ';}

        var li = "<li "+disabledClass+"><input value='"+option.value+"' type='checkbox' "+checked+" "+disabled+" />&nbsp;"+option.text+"</li>";

        if(position === 'append') {
            if($("div#"+$(this).attr('rel')+" ul li.filterResult").length > 0){
                $(li).insertBefore($("div#"+$(this).attr('rel')+" ul li.filterResult"));
            }
            else{
                $("div#"+$(this).attr('rel')+" ul").append(li);
            }
        }
        else {
            if(position === 'prepend'){
               $(li).insertAfter($("div#"+$(this).attr('rel')+" ul li.deselectall"));
            }
            else{
               $(li).insertAfter($("div#"+$(this).attr('rel')+" ul li input[value='"+position+"']").closest('li'));
            }
        }

        methods._refreshLive($(this).attr('rel'));
    }
            
    //,update : function( content ) {  }
};






$.fn.zmultiselect = function(methodOrOptions) {
    if ( methods[methodOrOptions] ) {
        return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        return methods.init.apply( this, arguments );
    } else {
        $.error( 'Method ' +  methodOrOptions + ' does not exist on zmultiselect' );
    }    
};



})( jQuery );

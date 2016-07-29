/**
 * ngUIDrawer.js
 * inspiração: http://www.material-ui.com/#/components/drawer
 * @directive ng-ui-drawer
 * @dependencies ngUI
 * @version 1.0.1
 */

(function(){
    
    var ON_RESIZE = {}, ON_TOUCH = {}, INDEX=0,
        UI_DRAWER_HIDE_CLASS = 'ng-ui-drawer-hide';
    
    angular.module('ngUI')
    .directive('ngUiDrawer', ['$animate', '$timeout', '$ui', function($animate, $timeout, $ui) {
        return {
            restrict: 'EA',
            transclude: true,
            template: '<div class="ng-ui-drawer-obfuscator"></div><div ng-transclude></div>',
            link: function ($scope, $element, attr) {
                var self, e = $element.children()[1];
                
                INDEX++;
                ON_RESIZE[INDEX] = function(){
                    
                    if ($element.$$defaultState==='open'){
                        $element
                            .removeClass(UI_DRAWER_HIDE_CLASS)
                            .removeClass(UI_DRAWER_HIDE_CLASS+'--none');
                    }else{
                        $element
                            .addClass(UI_DRAWER_HIDE_CLASS);
                    }
                    
                };
                ON_TOUCH[INDEX] = function(ev){
                    //TODO: completar a implementação;
                    return;
                    
                    if (ev.target===$element[0]){
                        var w = e.offsetWidth, ww,
                            x = ev.deltaX - w;
                        
                        //remove a animação
                        if (!$element.$$initPan){
                            $element.$$initPan = true;
                            $element
                                .removeClass('ng-ui-drawer--hide')
                                .addClass('ng-ui-drawer-cancel-animate');
                        }
                        
                        if (x>0){
                            x = 0;
                        }
                        
                        if (ev.type==='panend' || ev.type==='pancancel'){
                            $element.$$initPan = false;
                            $element.removeClass('ng-ui-drawer-cancel-animate');
                            
                            ww = - (w/2);
                            if ( x > ww ){
                                self.show();
                            }else{
                                self.hide();
                            }
                        }else if (ev.additionalEvent==='panright' || ev.additionalEvent==='panleft'){
                            e.style.transform = 'translate3d(' + x + 'px, 0, 0)';
                        }
                    }
                };
                
                //transporta qualquer classe definida na raiz para o element interno ng-transclude
                e.className = "ng-ui-drawer-content " + ($element.attr('class')||'');
                
                //transporta o estilo classe definida na raiz para o element interno ng-transclude
                e.setAttribute('style', $element.attr('style'));
                
                $element
                    .css({background:'transparent', width:'3px'})
                    .addClass('ng-ui-drawer')
                    .on('mousedown', onMouseDown);
            
                $scope.$on('destroy', function(){
                    delete(ON_RESIZE[INDEX]);
                    delete(ON_TOUCH[INDEX]);
                    $element.off('mousedown', onMouseDown);
                });
                
                //public methods
                self = {
                    /**
                     * Se flag=auto, recolhe o componente ao clicar fora
                     * Se flag=restore, restaura o css e classes do componente ao chamar o método hide
                     * Se flag=auto|restore, restaura o css e classes do componente ao chamar o método hide ou clicar fora
                     * @param {string} flag Opcional ("auto" ou "restore")
                     */
                    docked: function(flag){
                        copyOriginalStyle();
                        if (flag || flag===undefined){
                            $element.attr('docked', flag || '');
                        }else{
                            $element.removeAttr('docked');
                        }

                        return this;
                    },
                    hide: function(onHideComplete){
                        copyOriginalStyle();
                        
                        apply(function(){
                            var v = $element.attr('docked');
                            
                            $element.attr('state', 'close');
                            
                            if (v && v.exist('restore')){
                                if (self._docked===undefined){
                                    $element.removeAttr('docked');
                                }
                                $element.removeClass(UI_DRAWER_HIDE_CLASS);
                                $element[0].style.cssText = self._style;
                            }else{
                                $animate.addClass($element, UI_DRAWER_HIDE_CLASS).then(function(){
                                    $element
                                        .removeClass(UI_DRAWER_HIDE_CLASS)
                                        .addClass(UI_DRAWER_HIDE_CLASS+'--none');
                                
                                    if (onHideComplete) onHideComplete();
                                });                                    
                            }
                            
                        });
                        return this;
                    },
                    show: function(fnShowComplete){
                        copyOriginalStyle();
                        
                        $element
                            .removeClass(UI_DRAWER_HIDE_CLASS+'--none')
                            .addClass('ng-ui-drawer-hide');
                                
                        apply(function(){
                            $element.attr('state', 'open');

                            $animate.removeClass($element, UI_DRAWER_HIDE_CLASS).then(function(){
                                if (fnShowComplete) fnShowComplete();
                            });
                        });

                        return this;
                    },
                    state: function(){
                        return $element.attr('state');
                    }
                };
                
                $ui.register($scope, self, $element, attr.ngUiDrawer);
                
                $element.$$defaultState = attr.state || 'open';
                
                if (attr.state==='close'){
                    $element
                        .addClass(UI_DRAWER_HIDE_CLASS);
                }
                
                function apply(fn){
                    $timeout(function(){
                        $scope.$apply(fn);
                    });
                }
                function onMouseDown(event){
                    var v = $element.attr('docked') || "";
                    if (v.exist('auto') && !$ui.DOM.closet(event.target, '.ng-ui-drawer-content')){
                        self.hide();
                    }
                }
                function copyOriginalStyle(){
                    if (self._style===undefined){
                        self._style = $element[0].style.cssText;
                        self._docked= $element.attr('docked');
                    }
                }
            }
        };
    }]);
    
    angular.element(window).on('resize', function(){
        for (var i in ON_RESIZE){
            ON_RESIZE[i]();
        }
    });
    
    if (window.Hammer){
        angular.element(document).ready(function () {
            var mc = Hammer(document.body, {touchAction: 'pan-x'});
            mc.on("panstart panmove panend pancancel", function(ev) {
                for (var i in ON_TOUCH){
                    ON_TOUCH[i](ev);
                }
            });
        });
    }
    
}());


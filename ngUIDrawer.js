/**
 * ngUIDrawer.js
 * inspiração: http://www.material-ui.com/#/components/drawer
 * @directive ui-drawer
 * @dependencies angular, ngAnimate, ngUI
 * 
 */

(function(){
    
    var UI_DRAWER_HIDE_CLASS = 'ui-drawer-hide',
        UI_DRAWER_SHOW_CLASS = 'ui-drawer-show';
    
    angular.module('ngUI')
    .directive('uiDrawer', ['$animate', '$timeout', '$ngUI', function($animate, $timeout, $ngUI) {
        return {
            restrict: 'EA',
            transclude: true,
            template: '<div ng-transclude></div>',
            link: function ($scope, $element, attr) {
                var methods, e = $element.children()[0];
                
                //transporta qualquer classe definida na raiz para o element interno ng-transclude
                e.className = "ui-drawer-content " + ($element.attr('class')||'');
                $element.removeAttr('class');
                
                $element.on('mousedown', onMouseDown);
                $scope.$on('destroy', function(){
                    $element.off('mousedown', onMouseDown);
                });
                
                //public methods
                methods = {
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
                            
                            $element.removeClass(UI_DRAWER_SHOW_CLASS);
                            
                            if (v && v.exist('restore')){
                                if (methods._docked===undefined){
                                    $element.removeAttr('docked');
                                }
                                $element.removeClass(UI_DRAWER_HIDE_CLASS);
                                $element[0].style.cssText = methods._style;
                            }else{
                                $animate.addClass($element, UI_DRAWER_HIDE_CLASS).then(function(){
                                    $element.css('display', 'none');
                                    if (onHideComplete) onHideComplete();
                                });
                            }
                            
                        });
                        return this;
                    },
                    show: function(fnShowComplete){
                        copyOriginalStyle();
                        apply(function(){
                            $element
                                .addClass(UI_DRAWER_HIDE_CLASS + ' ' + UI_DRAWER_SHOW_CLASS)
                                .css('display', '');
                        
                            $animate.removeClass($element, UI_DRAWER_HIDE_CLASS).then(function(){
                                if (fnShowComplete) fnShowComplete();
                            });
                        });
                        return this;
                    },
                    state: function(){
                        return $element[0].className.indexOf(UI_DRAWER_HIDE_CLASS)>=0 ? 'close' : 'open';
                    }
                };
                
                $ngUI.register($scope, methods, $element, attr.uiDrawer);
                
                function apply(fn){
                    $timeout(function(){
                        $scope.$apply(fn);
                    });
                }
                function onMouseDown(event){
                    var v = $element.attr('docked') || "";
                    if (v.exist('auto') && !$ngUI.DOM.closet(event.target, UI_DRAWER_HIDE_CLASS)){
                        methods.hide();
                    }
                }
                function copyOriginalStyle(){
                    if (methods._style===undefined){
                        methods._style = $element[0].style.cssText;
                        methods._docked= $element.attr('docked');
                    }
                }
            }
        };
    }]);
    
}());


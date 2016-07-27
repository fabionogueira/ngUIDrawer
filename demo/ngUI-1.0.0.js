/**
 * ngUI.js
 * @version 1.0.0
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
 * @description text
 * @param {Object} $scope
 * @param {Object} publics Métodos públicos do component
 * @param {HTMLElement} $element angular.element
 * @param {String} name Nome da instância do componente
 */

(function(){
    var ngUI, ngUIModule, $modules = {}, DOM;
    
    angular.module('ngUI',[])
        .service('$ngUI', [function(){
            return ngUI; 
        }])
        .service('ngUIModule', [function(){
            return ngUIModule; 
        }]);
    
    ngUIModule = function($scope){
        $scope.$$isUIModule = true;
    };
    
    function initScopeModule($scope){
        if ($scope.$$uiModuleInit) return;
        
        $modules[$scope.$id] = {};
        $scope.$$uiModuleInit = true;
        
        $scope.$UI = function(name){
            return $modules[$scope.$id][name];
        };
        $scope.$on('destroy', function(){
            var i, o=$modules[$scope.$id];
            
            for (i in o){
                setUnObservable(o[i]);
            }
            
            delete($scope.$UI);
            delete($modules[$scope.$id]);
        });
    }
    function getModule($scope){
        while ($scope){
            if ($scope.$$isUIModule) return $scope;
            $scope = $scope.$parent;
        }
        return null;
    }
    function emit(event, args, context) {
        var i, listeners = this.$_observable_listeners[event];

        if (listeners) {
            args = alight.f$.isArray(args) ? args : [args];
            for (i = 0; i < listeners.length; i++) {
                listeners[i].apply(context || this.$_observable_context || this, args);
            }
        }
    }
    function on(event, cb) {
        var
                listeners = this.$_observable_listeners;

        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(cb);

        return this.$_observable_context || this;
    }
    function setObservable (obj, context) {
        if (!obj.$_observable_listeners) {
            obj.$_observable_listeners = {};
            obj.$_observable_context = context;
            obj.emit = emit;
            obj.on = on;
        }
        return obj;
    };
    function setUnObservable (obj) {
        var i;
            
        for (i in obj){
            delete(obj.$_observable_listeners);
            delete(obj.$_observable_context);
            delete(obj.emit);
            delete(obj.on);
            delete(obj.focus);
        }
        
    };
    function domGetTransitionDuration($element){
        var o = getComputedStyle($element[0]),
            s = o.transitionDuration;

        if (s){
            return Number(s.replace('s','').replace('ms','')) * 1000;
        }else{
            return 0;
        }
    }
    function HTMLElement(element){
        return element[0] || element;
    }
    function angularElement($element){
        return $element[0] ? $element : angular.element($element);
    }
    function initSelector(selector){
        var t, a, c, v1, v2;

        c = selector.substr(0,1);

        if (c==='#'){
            t = 'id';
            v1 = selector.substr(1);
        }else if (c==='['){
            t = 'attr';
            a = selector.substr(1, selector.length-2).split('=');
            v1= a[0];
            v2= a[1];
        }else if (c==='.'){
            t = 'cls';
            v1= selector.substr(1);
        }else{
            t = 'elem';
            v1= selector;
        }

        return {
            tp: t,
            v1: v1,
            v2: v2
        };
    }
    function checkSelector(element, selector){
        var r;

        if (selector.tp === 'id'){
            r = element.getAttribute('id')===selector.v1;
        }else if (selector.tp === 'attr'){
            r = element.hasAttribute(selector.v1);
            if (r && selector.v2){
                r = element.getAttribute(selector.v1)===selector.v2;
            }
        }else if (selector.tp==='cls'){
            r = element.className.indexOf(selector.v1)>-1;
        }else {
            r = element.localName === selector.v1;
        }

        return r;
    }
    
    DOM = {
        closet: function(element, selector){
            var s = initSelector(selector);
            
            element = HTMLElement(element);
            
            while (element && element.getAttribute){
                if (checkSelector(element, s)){
                    return angular.element(element);
                }

                element = element.parentNode;
            }
            return null;
        },
        find: function(element, selector){
            var i, c, e, s, children;

            element = HTMLElement(element);
            s       = initSelector(selector),
            children= element.childNodes;

            for (i=0; i<children.length; i++){
                c = children[i];
                if (c.getAttribute){
                    if (checkSelector(c, s)){
                        return angular.element(c);
                    }

                    e = angular.fx.dom.find(c, selector);

                    if (e){
                        return e;
                    }
                }
            }

            return null;
        },
        show: function($element, fn){
            $element = angularElement($element);
            $element.addClass('ng-hide-animate');

            setTimeout(function(){
                $element.removeClass('ng-hide');
            }, 1);

            setTimeout(function(){
                $element.removeClass('ng-hide-animate');
                $element[0]._visible = true;
                if (fn) fn();
            }, domGetTransitionDuration($element));
        },
        hide: function($element, fn){
            $element = angularElement($element);
            $element.addClass('ng-hide ng-hide-animate');

            setTimeout(function(){
                $element.removeClass('ng-hide-animate');
                $element[0]._visible = false;
                if (fn) fn();
            }, domGetTransitionDuration($element));
        },
        height: function(element) {
            element = HTMLElement(element);
            
            if (element===document || element===document.body || element===window){
                var D = document;

                return Math.max(
                    D.body.scrollHeight, D.documentElement.scrollHeight,
                    D.body.offsetHeight, D.documentElement.offsetHeight,
                    D.body.clientHeight, D.documentElement.clientHeight
                );
            }else{
                return element.offsetHeight;
            }
        },
        rect: function(element){
            var h, r;

            if (!element){
                r = {top:0,left:0,width:0,height:0};
                h = 0;
            }else {
                element = HTMLElement(element);
                
                if (element===document || element===document.body || element===window){
                    var D = document;

                    r = D.body.getBoundingClientRect();
                    h = Math.max(
                        D.body.scrollHeight, D.documentElement.scrollHeight,
                        D.body.offsetHeight, D.documentElement.offsetHeight,
                        D.body.clientHeight, D.documentElement.clientHeight
                    );
                }else{
                    r = element.getBoundingClientRect();
                    h = r.height;
                }
            }
            
            return {
                top: r.top,
                left: r.left,
                width: r.width,
                height: h
            };
        },
        dataClick: function(event){
            var a, v, e, target = event.target || event.srcElement;

            e = angular.fx.dom.closet(target, '[data-click]');
            v = {key:null, value:null, target:null};

            if (e){
                a = e.getAttribute('data-click').split(':');
                v.key    = a[0];
                v.value  = a[1] || null;
                v.target = e;
            }

            return v;
        },
        focus: function(id){
            var e = document.getElementById(id);

            try{
                document.activeElement.blur();
                if (e){
                    e.focus();
                }
            }catch(_e){}
        }
    };
    
    if (!String.prototype.exist){
        String.prototype.exist = function(str){
            return this.indexOf(str)>-1 ? true : false;
        };
    }
    
    ngUI = {
        register: function($scope, publics, $element, name){
            var $scopeModule;
            
            name = name || $element.attr('name');

            if (name){
                $scopeModule = getModule($scope);
                if ($scopeModule){
                    initScopeModule($scopeModule);

                    publics = publics || {};
                    setObservable(publics, $scopeModule);
                    $modules[$scope.$id][name] = publics;
                }
            }
        },
        
        /**
         * Retorna um json referente aos valores definidos no atributo properties ou na tag properties:
         * @example
         *      <div properties='{"key":"value"}'></div>
         *      <div>
         *          <properties key1="value1" key2="value2"></properties>
         *      </div>
         * @param {type} element HTMLElement
         * @returns {Object}
         */
        attributesToJson: function (element) {
            var i, propertiesElement,
                json = {},
                attr = element.getAttribute('properties');

            if (attr){
                try{json = JSON.parse(attr)}catch(_e){json={};}
            }else{
                propertiesElement = element.children[0];
                if (propertiesElement && propertiesElement.localName==='properties'){
                    attr = propertiesElement.attributes;
                    for (i = 0; i < attr.length; i++) {
                        json[attr[i].name] = attr[i].value;
                    }
                }
            }

            if (element.$properties){
                for (i in element.$properties){
                    json[i] = element.$properties[i];
                }
                delete(element.$properties);
            }

            return json;
        },
        observable: setObservable,
        unobservable: setUnObservable,
        DOM: DOM
    };
}());

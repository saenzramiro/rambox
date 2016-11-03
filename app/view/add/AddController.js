Ext.define('Rambox.view.add.AddController', {
	 extend: 'Ext.app.ViewController'
	,alias: 'controller.add-add'

	,doCancel: function( btn ) {
		var me = this;

		me.getView().close();
	}

	,doSave: function( btn ) {
		var me = this;

		var win = me.getView();
		if ( !win.down('form').isValid() ) return false;

		var formValues = win.down('form').getValues();

		if ( win.edit ) {
			// Format data
			if ( win.service.get('url').indexOf('___') >= 0 ) {
				formValues.url = formValues.cycleValue === '1' ? win.service.get('url').replace('___', formValues.url) : formValues.url;
			}

			var oldData = win.record.getData();
			win.record.set({
				 logo: formValues.logo
				,name: formValues.serviceName
				,url: formValues.url
				,align: formValues.align
				,notifications: formValues.notifications
				,muted: formValues.muted
				,trust: formValues.trust
				,js_unread: formValues.js_unread
			});
			// Change the title of the Tab
			Ext.getCmp('tab_'+win.record.get('id')).setTitle(formValues.serviceName);
			// Change sound of the Tab
			Ext.getCmp('tab_'+win.record.get('id')).setAudioMuted(formValues.muted);
			// Change notifications of the Tab
			Ext.getCmp('tab_'+win.record.get('id')).setNotifications(formValues.notifications);
			// Change the icon of the Tab
			if ( win.record.get('type') === 'custom' && oldData.logo !== formValues.logo ) Ext.getCmp('tab_'+win.record.get('id')).setConfig('icon', formValues.logo === '' ? 'resources/icons/custom.png' : formValues.logo);
			// Change the URL of the Tab
			if ( oldData.url !== formValues.url ) Ext.getCmp('tab_'+win.record.get('id')).setURL(formValues.url);
			// Change the align of the Tab
			if ( oldData.align !== formValues.align ) {
				if ( formValues.align === 'left' ) {
					Ext.cq1('app-main').moveBefore(Ext.getCmp('tab_'+win.record.get('id')), Ext.getCmp('tbfill'));
				} else {
					Ext.cq1('app-main').moveAfter(Ext.getCmp('tab_'+win.record.get('id')), Ext.getCmp('tbfill'));
				}
			}
			// Apply the JS Code of the Tab
			if ( win.down('textarea').isDirty() ) {
				Ext.Msg.confirm('CUSTOM CODE', 'Rambox needs to reload the service to execute the new JavaScript code. Do you want to do it now?', function( btnId ) {
					if ( btnId === 'yes' ) Ext.getCmp('tab_'+win.record.get('id')).reloadService();
				});
			}

			Ext.getCmp('tab_'+win.record.get('id')).record = win.record;
			Ext.getCmp('tab_'+win.record.get('id')).tabConfig.service = win.record;
		} else {
			// Format data
			if ( win.record.get('url').indexOf('___') >= 0 ) {
				formValues.url = formValues.cycleValue === '1' ? win.record.get('url').replace('___', formValues.url) : formValues.url;
			}
			
			var service = Ext.create('Rambox.model.Service', {
				 type: win.record.get('id')
				,logo: formValues.logo
				,name: formValues.serviceName
				,url: formValues.url
				,align: formValues.align
				,notifications: formValues.notifications
				,muted: formValues.muted
				,trust: formValues.trust
				,js_unread: formValues.js_unread
			});
			service.save();
			Ext.getStore('Services').add(service);

			var tabData = {
				 xtype: 'webview'
				,id: 'tab_'+service.get('id')
				/*
				,title: service.get('name')
				,icon: service.get('logo')
				,src: service.get('url')
				,type: service.get('type')
				,align: formValues.align
				,notifications: formValues.notifications
				,muted: formValues.muted
				*/
				,record: service
				,tabConfig: {
					service: service
				}
			};

			if ( formValues.align === 'left' ) {
				var tbfill = Ext.cq1('app-main').getTabBar().down('tbfill');
				Ext.cq1('app-main').insert(Ext.cq1('app-main').getTabBar().items.indexOf(tbfill), tabData).show();
			} else {
				Ext.cq1('app-main').add(tabData).show();
			}
		}

		win.close();
	}

	,onEnter: function(field, e) {
		var me = this;

		if ( e.getKey() == e.ENTER && field.up('form').isValid() ) me.doSave();
	}

	,onShow: function(win) {
		var me = this;

		// Make focus to the name field
		win.down('textfield[name="serviceName"]').focus(true, 100);
	}

});

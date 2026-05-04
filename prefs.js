import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

export default class AppNameIndicatorPrefs extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    this.initTranslations();
    const _ = this.gettext.bind(this);
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({
      title: _("User Configuration"),
      description: _(
        "Variables: {real_name}, {user_name}, {host_name}, {session_name}",
      ),
    });
    window.add(page);
    page.add(group);

    // Indicator Type Row
    const typeRow = new Adw.ComboRow({
      title: _("Indicator Type"),
      model: new Gtk.StringList({
        strings: [
          _("Real Name"),
          _("User Name"),
          _("Host Name"),
          _("Session (User@Host)"),
          _("Custom"),
        ],
      }),
    });
    group.add(typeRow);

    settings.bind(
      "indicator-type",
      typeRow,
      "selected",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Custom Format Row
    const customFormatRow = new Adw.EntryRow({
      title: _("Custom Format"),
    });
    group.add(customFormatRow);

    settings.bind(
      "custom-format",
      customFormatRow,
      "text",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Show/Hide Custom Format based on selection
    const updateCustomRowVisibility = () => {
      customFormatRow.visible = typeRow.selected === 4;
    };

    typeRow.connect("notify::selected", updateCustomRowVisibility);
    updateCustomRowVisibility();
  }
}

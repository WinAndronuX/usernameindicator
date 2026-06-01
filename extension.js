import St from "gi://St";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

export default class AppNameIndicator extends Extension {
  enable() {
    this.initTranslations();
    this._settings = this.getSettings();

    this._box = new St.BoxLayout({
      y_align: Clutter.ActorAlign.CENTER,
      x_align: Clutter.ActorAlign.START,
      style_class: "panel-button",
    });

    this._label = new St.Label({
      text: "...",
      y_align: Clutter.ActorAlign.CENTER,
    });

    this._box.add_child(this._label);

    // Add to QuickSettingsMenu
    const QuickSettingsMenu = Main.panel.statusArea.quickSettings;
    if (QuickSettingsMenu && QuickSettingsMenu._indicators) {
      QuickSettingsMenu._indicators.insert_child_at_index(this._box, 0);
    }

    this._changedId1 = this._settings.connect("changed::indicator-type", () =>
      this._updateLabel(),
    );
    this._changedId2 = this._settings.connect("changed::custom-format", () =>
      this._updateLabel(),
    );

    this._updateLabel();
  }

  disable() {
    if (this._changedId1) {
      this._settings.disconnect(this._changedId1);
      this._changedId1 = null;
    }
    if (this._changedId2) {
      this._settings.disconnect(this._changedId2);
      this._changedId2 = null;
    }

    const QuickSettingsMenu = Main.panel.statusArea.quickSettings;
    if (QuickSettingsMenu && QuickSettingsMenu._indicators && this._box) {
      QuickSettingsMenu._indicators.remove_child(this._box);
    }

    if (this._box) {
      this._box.destroy();
      this._box = null;
    }

    if (this._label) {
      this._label.destroy();
      this._label = null;
    }

    this._settings = null;
  }

  _updateLabel() {
    if (!this._label) return;

    const type = this._settings.get_int("indicator-type");
    const customFormat = this._settings.get_string("custom-format");

    const realName = GLib.get_real_name();
    const userName = GLib.get_user_name();
    const hostName = GLib.get_host_name();

    let text = "";
    switch (type) {
      case 0: // real_name
        text = realName;
        break;
      case 1: // user_name
        text = userName;
        break;
      case 2: // host_name
        text = hostName;
        break;
      case 3: // session_name
        text = `${userName}@${hostName}`;
        break;
      case 4: // custom
        text = customFormat
          .replace(/{real_name}/g, realName)
          .replace(/{user_name}/g, userName)
          .replace(/{host_name}/g, hostName)
          .replace(/{session_name}/g, `${userName}@${hostName}`);
        break;
      default:
        text = userName;
    }

    this._label.set_text(text + "  ");
  }
}

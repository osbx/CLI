// Core OSBX dependencies
import Component from "osbx/lib/core/component";
import { osbx_core } from "../plugins/osbx_core";

export default class Main extends Component {

    public Generate() {
        let core = this.GetPlugin("osbx_core") as osbx_core;
        core.GenerateBackground(0, 1000, "bg.jpg");
    }
}

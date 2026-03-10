import React from "react";
import { connect } from "react-redux";
import { AnchorButton, Tooltip, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";

import * as globals from "../../globals";
import styles from "./menubar.css";
import {
  setContinuousColormapAction,
  setContinuousColormapReverseAction,
} from "../../actions";

@connect((state) => ({
  colorMode: state.colors.colorMode,
  continuousColormap: state.colors.continuousColormap,
  continuousColormapReverse: state.colors.continuousColormapReverse,
}))
class ContinuousColormap extends React.PureComponent {
  handleColormapChange = (colormap) => {
    const { dispatch } = this.props;
    dispatch(setContinuousColormapAction(colormap));
  };

  handleReverseToggle = () => {
    const { dispatch, continuousColormapReverse } = this.props;
    dispatch(setContinuousColormapReverseAction(!continuousColormapReverse));
  };

  render() {
    const { colorMode, continuousColormap, continuousColormapReverse } =
      this.props;

    const isContinuous =
      colorMode === "color by continuous metadata" ||
      colorMode === "color by expression" ||
      colorMode === "color by geneset mean expression";

    const colormaps = ["viridis", "inferno", "Reds", "Blues", "RdBu"];

    return (
      <Popover2
        disabled={!isContinuous}
        content={
          <Menu>
            {colormaps.map((cmap) => (
              <MenuItem
                key={cmap}
                text={cmap}
                icon={continuousColormap === cmap ? "tick" : "blank"}
                onClick={() => this.handleColormapChange(cmap)}
              />
            ))}
            <Menu.Divider />
            <MenuItem
              text="Reverse Colormap"
              icon={continuousColormapReverse ? "tick" : "blank"}
              onClick={this.handleReverseToggle}
            />
          </Menu>
        }
        placement="bottom-end"
      >
        <Tooltip
          content="Change continuous colormap"
          position="bottom"
          hoverOpenDelay={globals.tooltipHoverOpenDelay}
          disabled={!isContinuous}
        >
          <AnchorButton
            type="button"
            className={styles.menubarButton}
            data-testid="colormap-button"
            icon="tint"
            disabled={!isContinuous}
          />
        </Tooltip>
      </Popover2>
    );
  }
}

export default ContinuousColormap;

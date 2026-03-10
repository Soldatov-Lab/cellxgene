import React from "react";
import { connect } from "react-redux";
import { AnchorButton, Tooltip, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";

import * as globals from "../../globals";
import styles from "./menubar.css";
import {
  setContinuousColormapAction,
  setContinuousColormapReverseAction,
  setContinuousColormapZOrderAction,
} from "../../actions";

@connect((state) => ({
  colorMode: state.colors.colorMode,
  continuousColormap: state.colors.continuousColormap,
  continuousColormapReverse: state.colors.continuousColormapReverse,
  continuousColormapZOrder: state.colors.continuousColormapZOrder,
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

  handleZOrderChange = (zOrder) => {
    const { dispatch } = this.props;
    dispatch(setContinuousColormapZOrderAction(zOrder));
  };

  render() {
    const {
      colorMode,
      continuousColormap,
      continuousColormapReverse,
      continuousColormapZOrder,
    } = this.props;

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
            <Menu.Divider />
            <MenuItem
              text="Max values on top"
              icon={continuousColormapZOrder === "max" ? "tick" : "blank"}
              onClick={() => this.handleZOrderChange("max")}
            />
            <MenuItem
              text="Min values on top"
              icon={continuousColormapZOrder === "min" ? "tick" : "blank"}
              onClick={() => this.handleZOrderChange("min")}
            />
            <MenuItem
              text="Extremes on top"
              icon={continuousColormapZOrder === "mid" ? "tick" : "blank"}
              onClick={() => this.handleZOrderChange("mid")}
            />
            <MenuItem
              text="Mid values on top"
              icon={continuousColormapZOrder === "mid_rev" ? "tick" : "blank"}
              onClick={() => this.handleZOrderChange("mid_rev")}
            />
            <MenuItem
              text="Random order"
              icon={continuousColormapZOrder === "random" ? "tick" : "blank"}
              onClick={() => this.handleZOrderChange("random")}
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

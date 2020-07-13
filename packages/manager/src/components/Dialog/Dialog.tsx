import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Button from 'src/components/Button';
import MUIDialog, {
  DialogProps as _DialogProps
} from 'src/components/core/Dialog';
import { createStyles, makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { convertForAria } from 'src/components/TabLink/TabLink';

export interface DialogProps extends _DialogProps {
  title: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(4),
      paddingTop: 0,
      maxHeight: '100%',
      '& .actionPanel': {
        marginTop: theme.spacing(2)
      },
      '& .selectionCard': {
        maxWidth: '100%',
        flexBasis: '100%'
      }
    },
    settingsBackdrop: {
      backgroundColor: 'rgba(0,0,0,.3)'
    },
    drawerHeader: {
      padding: theme.spacing(2)
    },
    drawerContent: {
      padding: theme.spacing(2),
      paddingTop: 0
    },
    button: {
      minWidth: 'auto',
      minHeight: 'auto',
      padding: 0,
      '& > span': {
        padding: 2
      },
      '& :hover, & :focus': {
        color: 'white',
        backgroundColor: theme.palette.primary.main
      }
    },
    backDrop: {
      backgroundColor: theme.color.drawerBackdrop
    },
    sticky: {
      position: 'sticky',
      top: 0,
      padding: theme.spacing(2),
      paddingRight: theme.spacing(),
      margin: '8px -8px',
      background: theme.color.white,
      zIndex: 1,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between'
    }
  })
);

const Dialog: React.FC<DialogProps> = props => {
  const { title, children, ...rest } = props;

  const classes = useStyles();

  const titleID = convertForAria(title);

  return (
    <MUIDialog
      title={title}
      maxWidth={props.maxWidth ?? 'md'}
      {...rest}
      classes={{ paper: classes.paper }}
      data-qa-drawer
      data-testid="drawer"
      role="dialog"
      aria-labelledby={titleID}
      BackdropProps={{
        className: classes.settingsBackdrop
      }}
    >
      <Grid
        container
        justify="space-between"
        alignItems="center"
        updateFor={[title, props.children]}
      >
        <div className={classes.sticky}>
          <Grid item>
            <Typography variant="h2" id={titleID} data-qa-drawer-title={title}>
              {title}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              buttonType="secondary"
              onClick={props.onClose as (e: any) => void}
              className={classes.button}
              data-qa-close-drawer
              aria-label="Close drawer"
            >
              <Close />
            </Button>
          </Grid>
        </div>
        <Grid container>
          <div className={classes.drawerContent}>{children}</div>
        </Grid>
      </Grid>
    </MUIDialog>
  );
};

export default Dialog;

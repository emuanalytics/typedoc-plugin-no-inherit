import {
  Application, Context, Converter, Logger
} from 'typedoc';

/**
 * A handler that deals with inherited reflections.
 */
export class NoInheritPlugin {
  /**
   * Hook up to TypeDoc logger.
   */
  private logger: Logger;

  /**
   * Create a new NoInheritPlugin instance.
   */
  initialize(app: Application) {
    app.converter.on(Converter.EVENT_RESOLVE_END, this.onEndResolve.bind(this));
    this.logger = app.logger;
  }

  /**
   * Triggered when the converter ends resolving a project.
   *
   * Goes over the list of inherited reflections and removes any that are down the hierarchy
   * from a class that doesn't inherit docs.
   *
   * @param context The context object describing the current state the converter is in.
   */
  private onEndResolve(context: Context) {
    const project = context.project;
    const refsToRemove = [];

    // Find all reflections that are inherited from a class marked with `@noInheritDoc`.
    Object.keys(project.reflections).forEach((key) => {
      const reflection = project.reflections[key];
      if (reflection.inheritedFrom && reflection.parent?.comment?.hasModifier('@noInheritDoc')) {
        refsToRemove.push(reflection);
      }
    });

    // Remove refs
    refsToRemove.forEach((reflection) => {
      project.removeReflection(reflection);
    })

    // Remove @noInheritDoc from all reflections so that
    // it doesn't appear in docs.
    Object.keys(project.reflections).forEach((key) => {
      const reflection = project.reflections[key];
      if (reflection.comment?.hasModifier('@noInheritDoc')) {
        reflection.comment.removeModifier('@noInheritDoc');
      }
    });
  }
}

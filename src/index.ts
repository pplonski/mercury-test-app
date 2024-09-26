import { PageConfig, URLExt } from '@jupyterlab/coreutils';
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  'example/'
);

import { applyJupyterTheme } from '@jupyter/web-components';

import '@jupyterlab/application/style/index.css';
import '@jupyterlab/codemirror/style/index.css';
// import '@jupyterlab/completer/style/index.css';
import '@jupyterlab/documentsearch/style/index.css';
import '@jupyterlab/notebook/style/index.css';
import '@jupyterlab/theme-light-extension/style/theme.css';

import '../style/index.css';

// Apply JupyterLab theme to the Jupyter toolkit
window.addEventListener('load', () => {
  applyJupyterTheme();
});

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ServiceManager } from '@jupyterlab/services';
// , CodeMirrorMimeTypeService, EditorLanguageRegistry 
import { CodeMirrorEditorFactory, CodeMirrorMimeTypeService, EditorLanguageRegistry } from '@jupyterlab/codemirror';
import { RenderMimeRegistry, standardRendererFactories } from '@jupyterlab/rendermime';
import { NotebookModelFactory, NotebookPanel, StaticNotebook } from '@jupyterlab/notebook';
import { DocumentManager } from '@jupyterlab/docmanager';
import { Panel, Widget } from '@lumino/widgets';
import { MercuryWidgetFactory } from '@mljar/mercuryextension';
import { MercuryWidget } from '@mljar/mercuryextension/lib/mercury/widget';


// import { MercuryWidgetFactory } from '@mljar/mercuryextension'

function main(): void {
  console.log('main()');
  const manager = new ServiceManager();
  void manager.ready.then(() => {
    console.log('manager ready');
    createApp(manager);
  });
}

function createApp(manager: ServiceManager.IManager): void {
  console.log('createApp');
  const notebookPath = PageConfig.getOption('notebookPath');
  console.log(notebookPath);
  console.log(PageConfig);
  // const commands = new CommandRegistry();
  const languages = new EditorLanguageRegistry();
  const rendermime = new RenderMimeRegistry({
    initialFactories: standardRendererFactories,
    // latexTypesetter: new MathJaxTypesetter(),
    // markdownParser: createMarkdownParser(languages)
  });

  const mimeTypeService = new CodeMirrorMimeTypeService(languages);

  const docRegistry = new DocumentRegistry();
  
  const mFactory = new NotebookModelFactory({});
  
  const factoryService = new CodeMirrorEditorFactory({
    //extensions: editorExtensions(),
    //languages
  });
  const editorFactory = factoryService.newInlineEditor;

  const contentFactory = new NotebookPanel.ContentFactory({ editorFactory });
  // const wFactory = new NotebookWidgetFactory({
  //   name: 'Notebook',
  //   modelName: 'notebook',
  //   fileTypes: ['notebook'],
  //   defaultFor: ['notebook'],
  //   preferKernel: true,
  //   canStartKernel: true,
  //   rendermime,
  //   contentFactory,
  //   mimeTypeService,
  //   // toolbarFactory,
  //   notebookConfig: {
  //     ...StaticNotebook.defaultNotebookConfig,
  //     windowingMode: 'none'
  //   }
  // });
  // console.log(wFactory)
  const wFactory = new MercuryWidgetFactory({
    name: 'Mercury',
    fileTypes: ['notebook'],
    modelName: 'notebook',
    preferKernel: true,
    canStartKernel: true,
    rendermime: rendermime,
    contentFactory,
    editorConfig: StaticNotebook.defaultEditorConfig,
    notebookConfig: StaticNotebook.defaultNotebookConfig,
    mimeTypeService: mimeTypeService, 
    editorFactoryService: factoryService,
    notebookPanel: null
  });
  docRegistry.addModelFactory(mFactory);
  console.log(wFactory);
  docRegistry.addWidgetFactory(wFactory);


  const opener = {
    open: (widget: Widget) => {
      // Do nothing for sibling widgets for now.
    },
    get opened() {
      return {
        connect: () => {
          return false;
        },
        disconnect: () => {
          return false;
        }
      };
    }
  };
  const docManager = new DocumentManager({
    registry: docRegistry,
    manager,
    opener
  });
  const nbWidget = docManager.open(notebookPath) as MercuryWidget;
  console.log(nbWidget);
  const panel = new Panel();
  panel.id = 'main';
  panel.addWidget(nbWidget);
  Widget.attach(panel, document.body);
}

window.addEventListener('load', main);

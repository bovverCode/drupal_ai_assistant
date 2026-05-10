/**
 * `service` command — generate a Drupal service scaffold inside a module folder.
 */
import { Command, OptionValues } from 'commander';
import { FileSystemService } from '@/service/FileSystemService.ts';
import path from 'node:path';
import { geminiService } from '@/service/gemini.ts';
import { PromptInterface } from '@/prompt/PromptInterface.ts';
import { confirm } from '@inquirer/prompts';
import { __dirname, getPromptConfig } from '@/functions.ts';

/**
 * Define service data retrieved from Gemini API response.
 */
interface ServiceData {
    className: string,
    description: string,
    slug: string
}

/**
 * The maximum depth of the Drupal module info file directory lookup.
 */
const maxDepth: number = 7;

/**
 * Service prompt folder path.
 */
const promptFolderPath: string = path.join(__dirname, 'prompt/service');

/**
 * Register the `service` command.
 * Generates a Drupal service scaffold inside the given module folder.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program.commandsGroup()

    program
        .command('service')
        .description('generate a Drupal service scaffold')
        .argument('[service_info]', 'Information to create service')
        .option('-p, --path <path>', 'Relative path to the module folder', '')
        .action((serviceInfo: string, options: OptionValues) => {
            createService(serviceInfo, options.path)
                .then(() => console.log('✅ Service successfully created'))
                .catch(error => program.error('💀 ' + (error instanceof Error ? error.message : String(error))))
        });
}

/**
 * Generate a Drupal service scaffold based on the provided description.
 * @param serviceInfo - Human-readable description of the service to generate.
 * @param lookupPath - Relative path to the Drupal module directory.
 */
async function createService(serviceInfo: string, lookupPath: string): Promise<void> {
    // Find the Drupal module directory.
    lookupPath = path.join(process.cwd(), lookupPath);
    const modulePath: string = await getModulePath(lookupPath, maxDepth);

    // Generate service data.
    let serviceData: ServiceData = await generateServiceData(serviceInfo);
    console.log(serviceData);
    while (!await confirm({message: 'Are you fine with the naming?'})) {
        serviceData = await generateServiceData(serviceInfo, serviceData);
        console.log(serviceData);
    }

    const serviceFolderName: string = await createServiceClass(serviceData, modulePath);
    await updateServiceYamlFile(serviceData, modulePath, serviceFolderName);
}

/**
 * Recursively search for the Drupal module directory.
 * @param lookupPath - Initial path to search from.
 * @param retry - Number of times to retry the search.
 * @returns Absolute path to the Drupal module directory.
 */
async function getModulePath(lookupPath: string, retry: number): Promise<string> {
    try {
        // Try to find the module info file.
        await FileSystemService.getFileAbsolutePath(lookupPath, '.+\\.info\\.yml$')
        return lookupPath;
    } catch (error) {
        if (retry > 0) {
            return getModulePath(path.resolve(lookupPath, '..'), retry - 1);
        }
        throw new Error('Could not find Drupal module directory');
    }
}

/**
 * Generate service data based on the provided description.
 * @param serviceInfo - Input description of the service to generate.
 * @param previousData - Previously generated service data.
 * @returns Service data object.
 */
async function generateServiceData(
    serviceInfo: string,
    previousData: Partial<ServiceData> = {}
): Promise<ServiceData> {
    const promptConfig: PromptInterface = await getPromptConfig(path.join(promptFolderPath, 'service.yml'));
    const message: string = promptConfig.message.replace('${user_input}', serviceInfo);
    // Add previous data to the message if it exists (retry case).
    const finalMessage = previousData.className ?
        message + ' ' + promptConfig.retry.replace('${user_input}', JSON.stringify(previousData)) :
        message;
    const response: string = await geminiService.sendMessage(finalMessage, {
        systemInstruction: promptConfig.instruction,
        temperature: 0,
        stopSequences: ["\n"]
    });
    const [className, description, slug] = response.split('|').map((item: string) => item.trim());
    if (!className || !description || !slug)  {
        throw new Error('Invalid response from Gemini API. Please try again.')
    }
    return {
      className,
      description,
      slug
    };
}

/**
 * Create a service class in the module.
 * @param serviceData - Service data object.
 * @param modulePath - Path to Drupal module directory.
 * @returns Service folder name (we need it to build namespace in the future).
 */
async function createServiceClass(serviceData: ServiceData, modulePath: string): Promise<string> {
    let serviceFolder: string = 'Services';
    let files: string[] = [];
    // Make sure service folder exists.
    const serviceFolderNames: string[] = ['Services', 'Service', ''];
    for (const serviceFolderName of serviceFolderNames) {
        if (!serviceFolderName) {
            // Create services folder in case it doesn't exist.
            await FileSystemService.createFolder(path.join(modulePath, 'src', serviceFolder));
            break;
        }
        try {
            files = await FileSystemService.listFolder(path.join(modulePath, 'src', serviceFolderName), ['php']);
            serviceFolder = serviceFolderName;
            break;
        } catch {}
    }
    if (files.includes(serviceData.className + '.php')) {
        throw new Error('Service already exists');
    }

    // Prepare service class data.
    const promptConfig: PromptInterface = await getPromptConfig(path.join(promptFolderPath, 'service_class_content.yml'));
    const moduleSlug: string | undefined = extractModuleSlug(modulePath);
    if (!moduleSlug) throw new Error('Could not get module slug from: ' + modulePath);
    const namespace: string = `Drupal\\${moduleSlug}\\${serviceFolder}`;
    const message = promptConfig.message
        .replace('${class_namespace}', namespace)
        .replace('${class_name}', serviceData.className)
        .replace('${class_description}', serviceData.description);
    const content: string = await geminiService.sendMessage(message, {
        systemInstruction: promptConfig.instruction,
    });
    await FileSystemService.createOrUpdateFile(
        path.join(modulePath, 'src', serviceFolder, serviceData.className + '.php'),
        content
    );

    return serviceFolder;
}

/**
 * Update or create a module.service.yml file.
 * @param serviceData - Service data object.
 * @param modulePath - Path to Drupal module directory.
 * @param serviceFolderName - Name of the service folder.
 */
async function updateServiceYamlFile(serviceData: ServiceData, modulePath: string, serviceFolderName: string): Promise<void> {
    const moduleSlug: string | undefined = extractModuleSlug(modulePath);
    const moduleServiceYamlPath: string = path.join(modulePath, `${moduleSlug}.services.yml`);

    // Prepare Gemini API request data.
    const promptConfig: PromptInterface = await getPromptConfig(path.join(promptFolderPath, 'service_yaml_content.yml'));
    const serviceSlug: string = `${moduleSlug}.${serviceData.slug}`;
    const serviceNameSpace: string = `\\Drupal\\${moduleSlug}\\${serviceFolderName}\\${serviceData.className}`
    const createServicesYaml: string = await FileSystemService.pathExists(moduleServiceYamlPath) ? 'FALSE' : 'TRUE';
    const message: string = promptConfig.message
        .replace('${service_slug}', serviceSlug)
        .replace('${class_namespace}', serviceNameSpace)
        .replace('${start_from_services}', createServicesYaml)
    const content: string = await geminiService.sendMessage(message, {
        systemInstruction: promptConfig.instruction,
    });

    await FileSystemService.createOrUpdateFile(moduleServiceYamlPath, content);
}

/**
 * Extract the module slug from the module path.
 *
 * The module slug is the last part of the path,
 * e.g. for path `modules/custom/my_module` the slug is `my_module`.
 *
 * @param modulePath Module path.
 * @returns Module slug.
 */
function extractModuleSlug(modulePath: string): string {
    const moduleSlug: string | undefined = modulePath.split(/[\/\\]/).pop();
    if (!moduleSlug) throw new Error('Could not get module slug from: ' + modulePath);
    return moduleSlug;
}

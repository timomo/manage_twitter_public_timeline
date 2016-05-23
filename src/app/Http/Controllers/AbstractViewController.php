<?php namespace core\Http\Controllers;

use Illuminate\Support\Facades\Route;

abstract class AbstractViewController extends Controller
{

    public function __construct()
    {
        $this->middleware('loglr');
        $this->middleware('auth');
        $this->middleware('permission', ['except' => 'redirect']);
        $this->middleware('get_lang');
        $this->middleware('get_core_menu');
        $this->middleware('maintenance');
    }

    protected function getView()
    {
        list($controller, $action) = explode('@', Route::currentRouteAction());
        $view = class_basename($controller);
        $view = preg_replace('/^View/', '', $view);
        $view = preg_replace('/Controller$/', '', $view);
        $view = strtolower($view);
        $action = preg_replace('/^get/', '', $action);
        $action = strtolower($action);

        $packages = explode("\\", $controller);
        if ($packages[0] === "PfTec") {
            $package = snake_case($packages[1]);

            $string = "{$package}::{$view}.{$action}";
        } else {
            $string = "{$view}.{$action}";
        }

        # Maintenance
        /*
        $m_access  = \Config::has("maintenance.".$view.".access")?  \Config("maintenance.".$view.".access") : true;
        $m_message = \Config::has("maintenance.".$view.".message")? \Config("maintenance.".$view.".message"): '';

        if (false === $m_access) {
            return view('errors.503', compact('m_message'));
        }

        */
        return view($string);
    }

    public function index()
    {
        return $this->getView();
    }

    public function create()
    {
        return $this->getView();
    }

    public function copy($id)
    {
        return $this->getView();
    }

    public function edit($id)
    {
        return $this->getView();
    }

    public function export()
    {
        list($controller, $action) = explode('@', Route::currentRouteAction());
        $view = class_basename($controller);
        $view = preg_replace('/^View/', '', $view);
        $view = preg_replace('/Controller$/', '', $view);
        $view = strtolower($view);
        $action = preg_replace('/^get/', '', $action);
        $action = strtolower($action);
        $isPlugin = false;

        $packages = explode("\\", $controller);
        if ($packages[0] === "PfTec") {
            $package = snake_case($packages[1]);
            $string = "{$package}::{$view}.{$action}";
            $isPlugin = true;
        } else {
            $string = "{$view}.{$action}";
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'. $view. '.csv"',
        ];
        try {
            $fp = fopen('php://temp/maxmemory:'.(5 * 1024 * 1024), 'r+');

            $model = $this->model;
            $key = new $model();
            $key = $key->getKeyName();
            $rows = $model::orderBy($key)->get();
            $result = $rows->toArray();
            $csvHeader = [];
            if (count($result) > 0) {
                if ($isPlugin === true) {
                    $csvHeader = (array)trans($package. '::messages.'. $view. '.export');
                } else {
                    $csvHeader = (array)trans('messages.'. $view. '.export');
                }
                fputcsv($fp, $csvHeader);
            }
            foreach ($result as $row) {
                $csv = [];
                foreach ($csvHeader as $name => $value) {
                    $csv[$name] = $row[$name];
                }
                fputcsv($fp, $csv);
            }
            rewind($fp);
            $result = stream_get_contents($fp);
            $result = mb_convert_encoding($result, 'SJIS-win', 'UTF-8');

            return \Response::make($result, 200, $headers);
        } catch (\Exception $e) {
            // $this->app['Illuminate\Contracts\Debug\ExceptionHandler']->report($e);
            \Log::error($e);
            return \Response::make("", 200, $headers);
        }
    }
}

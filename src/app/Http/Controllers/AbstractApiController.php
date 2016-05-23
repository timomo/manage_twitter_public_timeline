<?php namespace core\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Route;
use core\Models\CoreAuditlog;
use core\Models\InvalidModelException;
use Illuminate\Contracts\Foundation\Application;

abstract class AbstractApiController extends Controller
{

    public static $application_id = 0;
    protected $model;
    protected $actions = array(
            'index' => 1,
            'show' => 2,
            'store' => 3,
            'update' => 4,
            'destroy' => 5,
            'getTree' => 11,
        );
    // https://github.com/laravel/framework/blob/master/src/Illuminate/Foundation/Http/Kernel.php
    protected $app;

    protected $m_access;
    protected $m_message;

    public function __construct(Application $app)
    {
        $this->app = $app;
        $this->middleware('loglr');
        $this->middleware('auth');
        $this->middleware('permission');
        $this->middleware('get_lang');
        $this->middleware('auditlog');
        $this->middleware('maintenance');

        if (is_null(Route::currentRouteAction())) {
            return;
        }

        list($controller, $action) = explode('@', Route::currentRouteAction());
        $model = class_basename($controller);
        $model = preg_replace('/^Api/', '', $model);
        $model = preg_replace('/Controller$/', '', $model);
        $packages = explode("\\", $controller);
        if ($packages[0] === "PfTec") {
            $this->model = "{$packages[0]}\\{$packages[1]}\\Models\\". $model;
        } else {
            $this->model = "{$packages[0]}\\Models\\". $model;
        }

        # Maintenance
        /*
        $key = "maintenance.".strtolower($model);
        \Log::debug(print_r($key, true));
        $this->m_access   = \Config::has($key.".access")?  \Config($key.".access") : true;
        $this->m_message  = \Config::has($key.".message")? \Config($key.".message"): '';
        */
    }

    protected function checkMaintenance()
    {
        if (false === $this->m_access) {
            return response()->json($this->m_message, 503);
        }
        return false;
    }

    public function index()
    {
        $ret = $this->checkMaintenance();
        if (false !== $ret) {
            return $ret;
        }

        try {
            $model = $this->model;
            $key = new $model();
            $key = $key->getKeyName();
            $result = $model::orderBy($key)->get();
            $result = $result->toArray();
            return response()->json($result, 200);
        } catch (\Exception $e) {
            $this->app['Illuminate\Contracts\Debug\ExceptionHandler']->report($e);
            return response()->json(null, 500);
        }
    }

    public function store()
    {
        $ret = $this->checkMaintenance();
        if (false !== $ret) {
            return $ret;
        }

        try {
            $model = $this->model;
            $result = new $model();
            $params = Input::all();
            $result->fill($params);
            $result->save();
            return response()->json($result, 200);
        } catch (InvalidModelException $e) {
            \Log::warning($e->getMessage());
            return response()->json(json_decode($e->getMessage()), 422);
        } catch (\Exception $e) {
            $this->app['Illuminate\Contracts\Debug\ExceptionHandler']->report($e);
            return response()->json(null, 500);
        }
    }

    public function show($id)
    {
        $ret = $this->checkMaintenance();
        if (false !== $ret) {
            return $ret;
        }

        try {
            $model = $this->model;
            $result = $model::find($id);
            if (is_null($result)) {
                return response()->json(null, 404);
            }
            $result = $result->toArray();
            return response()->json($result, 200);
        } catch (\Exception $e) {
            $this->app['Illuminate\Contracts\Debug\ExceptionHandler']->report($e);
            return response()->json(null, 500);
        }
    }

    public function update($id)
    {
        $ret = $this->checkMaintenance();
        if (false !== $ret) {
            return $ret;
        }

        try {
            $model = $this->model;
            $result = $model::find($id);
            if (is_null($result)) {
                return response()->json(null, 404);
            }
            $params = Input::all();
            $result->fill($params);
            $result->save();
            return response()->json($result, 200);
        } catch (InvalidModelException $e) {
            \Log::warning($e->getMessage());
            return response()->json(json_decode($e->getMessage()), 422);
        } catch (\Exception $e) {
            $this->app['Illuminate\Contracts\Debug\ExceptionHandler']->report($e);
            return response()->json(null, 500);
        }
    }

    public function destroy($id)
    {
        $ret = $this->checkMaintenance();
        if (false !== $ret) {
            return $ret;
        }

        try {
            $model = $this->model;
            $result = $model::find($id);
            if (is_null($result)) {
                return response()->json(null, 404);
            }
            $res = $result->toArray();
            $result->delete();
            return response()->json($result, 200);
        } catch (InvalidModelException $e) {
            \Log::warning($e->getMessage());
            return response()->json(json_decode($e->getMessage()), 422);
        } catch (\Exception $e) {
            $this->app['Illuminate\Contracts\Debug\ExceptionHandler']->report($e);
            return response()->json(null, 500);
        }
    }
}
